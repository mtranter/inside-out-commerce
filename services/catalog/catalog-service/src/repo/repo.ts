import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoObject, tableBuilder } from "funamots";
import { TxOutboxMessage } from "dynamodb-kafka-outbox/dist/tx-outbox";
import { Product } from "./../models";
import { attributeNotExists } from "funamots/dist/lib/conditions";
import type { ProductRepo as IProductRepo } from "./../api/handlers";

type EventDto = {
  hk: string;
  sk: string;
  category?: string;
  subCategory?: string;
} & TxOutboxMessage;

type ProductDto = {
  hk: string;
  sk: string;
  category: string;
  subCategory: string;
  data: Product;
};

export type Dto = ProductDto | EventDto;

const base64EncodeObject = (o: DynamoObject) => {
  return Buffer.from(JSON.stringify(o)).toString("base64");
};

const decodeBase64Object = (s: string): DynamoObject => {
  return JSON.parse(Buffer.from(s, "base64").toString("utf-8"));
};

export const buildTable = (tableName: string, client?: DynamoDB) =>
  tableBuilder<Dto>(tableName)
    .withKey("hk", "sk")
    .withGlobalIndex("gsi1", "category", "hk")
    .withGlobalIndex("gsi2", "subCategory", "hk")
    .withGlobalIndex("gsi3", "sk", "hk")
    .build({ client: client ?? new DynamoDB({}) });

export const ProductRepo = ({
  tableName,
  client,
}: {
  tableName: string;
  client?: DynamoDB;
}): IProductRepo => {
  const productsTable = buildTable(tableName, client);
  return {
    get: async (sku: string) => {
      const product = await productsTable.get<ProductDto>({
        hk: `PRODUCT#${sku}`,
        sk: "#PRODUCT#",
      });
      return product?.data;
    },
    listProducts: async (next) => {
      const startKey = next ? decodeBase64Object(next) : undefined;
      const result = await productsTable.indexes.gsi3.query<ProductDto>("#PRODUCT#", {
        startKey,
        pageSize: 100,
      });
      return {
        products: result.records.map((i) => i.data),
        nextToken: result.nextStartKey
          ? base64EncodeObject(result.nextStartKey)
          : undefined,
      };
    },
    put: async (product: Product, event: TxOutboxMessage) => {
      await productsTable.transactPut([
        {
          item: {
            hk: `PRODUCT#${product.sku}`,
            sk: "#PRODUCT#",
            category: product.categoryId,
            subCategory: product.subCategory,
            data: product,
          },
          conditionExpression: {
            hk: attributeNotExists(),
          },
        },
        {
          item: {
            hk: `EVENT#${product.sku}`,
            sk: `#EVENT#${Date.now()}`,
            ...event,
          },
        },
      ]);
      return product;
    },
    listProductByCategory: async (categoryId, next) => {
      const startKey = next ? decodeBase64Object(next) : undefined;
      const result = await productsTable.indexes.gsi1.query<ProductDto>(
        categoryId,
        {
          startKey,
          pageSize: 100,
        }
      );
      return {
        products: result.records.map((i) => i.data),
        nextToken: result.nextStartKey
          ? base64EncodeObject(result.nextStartKey)
          : undefined,
      };
    },
    listProductBySubCategory: async (subCategoryId, next) => {
      const startKey = next ? decodeBase64Object(next) : undefined;
      const result = await productsTable.indexes.gsi2.query<ProductDto>(
        subCategoryId,
        {
          startKey,
          pageSize: 100,
        }
      );
      return {
        products: result.records.map((i) => i.data),
        nextToken: result.nextStartKey
          ? base64EncodeObject(result.nextStartKey)
          : undefined,
      };
    },
  };
};
