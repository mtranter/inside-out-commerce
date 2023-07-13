import { TxOutboxMessage } from "dynamodb-kafka-outbox";
import { Product } from "../../models";

export type ProductRepo = {
  get: (sku: string) => Promise<Product | undefined>;
  put: (product: Product, event: TxOutboxMessage) => Promise<Product>;
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
