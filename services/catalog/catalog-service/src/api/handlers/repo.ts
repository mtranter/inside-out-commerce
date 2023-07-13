import { TxOutboxMessage } from "dynamodb-kafka-outbox";
import { Product } from "../../models";

export type ProductRepo = {
  get: (sku: string) => Promise<Product | undefined>;
  put: (product: Product, event: TxOutboxMessage) => Promise<Product>;
  listProducts: (args?: {
    next?: string;
    pageSize?: number;
  }) => Promise<{ products: Product[]; nextToken?: string }>;
  listProductByCategory: (
    categoryId: string,
    args?: { next?: string; pageSize?: number }
  ) => Promise<{ products: Product[]; nextToken?: string }>;
  listProductBySubCategory: (
    subCategoryId: string,
    args?: { next?: string; pageSize?: number }
  ) => Promise<{ products: Product[]; nextToken?: string }>;
};
