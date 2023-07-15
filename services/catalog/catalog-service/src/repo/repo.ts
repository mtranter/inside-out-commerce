import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoObject, tableBuilder } from "funamots";
import { TxOutboxMessage } from "dynamodb-kafka-outbox/dist/tx-outbox";
import { Product } from "./../models";
import { attributeNotExists } from "funamots/dist/lib/conditions";
import { Dto, ProductDto } from "./types";
import { base64EncodeObject, buildEventKey, buildProductKey, buildProductSortKey, decodeBase64Object, getListOptions } from "./utils";

export const buildTable = (tableName: string, client?: DynamoDB) =>
  tableBuilder<Dto>(tableName)
    .withKey("hk", "sk")
    .withGlobalIndex("gsi1", "category", "hk")
    .withGlobalIndex("gsi2", "subCategory", "hk")
    .withGlobalIndex("gsi3", "sk", "hk")
    .build({ client: client ?? new DynamoDB({}) });

export type ProductRepo = {
  get: (sku: string) => Promise<Product | undefined>;
  put: (product: Product, event: TxOutboxMessage) => Promise<Product>;
  delete: (sku: string, event: TxOutboxMessage) => Promise<void>;
  listProducts: (args?: {
    nextToken?: string;
    pageSize?: number;
  }) => Promise<{ products: Product[]; nextToken?: string }>;
  listProductByCategory: (
    categoryId: string,
    args?: { nextToken?: string; pageSize?: number }
  ) => Promise<{ products: Product[]; nextToken?: string }>;
  listProductBySubCategory: (
    subCategoryId: string,
    args?: { nextToken?: string; pageSize?: number }
  ) => Promise<{ products: Product[]; nextToken?: string }>;
};

export const ProductRepo = ({
  tableName,
  client,
}: {
  tableName: string;
  client?: DynamoDB;
}): ProductRepo => {
  const productsTable = buildTable(tableName, client);
  

  return {
    get: async (sku: string) => {
      const product = await productsTable.get<ProductDto>(buildProductKey(sku));
      return product?.data;
    },
    listProducts: async (args) => {
      const startKey = args?.nextToken
        ? decodeBase64Object(args?.nextToken)
        : undefined;
      const result = await productsTable.indexes.gsi3.query<ProductDto>(
        buildProductSortKey(),
        getListOptions(args)
      );
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
            ...buildProductKey(product.sku),
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
            ...buildEventKey(product.sku),
            ...event,
          },
        },
      ]);
      return product;
    },
    delete: async (sku: string, event: TxOutboxMessage) => {
      await productsTable.transactWrite({
        deletes: [{ item: buildProductKey(sku) }],
        puts: [
          {
            item: { ...buildEventKey(sku), ...event },
          },
        ],
      });
    },
    listProductByCategory: async (categoryId, args) => {
      const startKey = args?.nextToken
        ? decodeBase64Object(args?.nextToken)
        : undefined;
      const result = await productsTable.indexes.gsi1.query<ProductDto>(
        categoryId,
        getListOptions(args)
      );
      return {
        products: result.records.map((i) => i.data),
        nextToken: result.nextStartKey
          ? base64EncodeObject(result.nextStartKey)
          : undefined,
      };
    },
    listProductBySubCategory: async (subCategoryId, args) => {
      const startKey = args?.nextToken
        ? decodeBase64Object(args?.nextToken)
        : undefined;
      const result = await productsTable.indexes.gsi2.query<ProductDto>(
        subCategoryId,
        getListOptions(args)
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
