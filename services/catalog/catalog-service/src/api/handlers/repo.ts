import { TxOutboxMessage } from "dynamodb-kafka-outbox";
import { Product } from "../../models";

export type ProductRepo = {
  get: (sku: string) => Promise<Product | undefined>;
  put: (product: Product, event: TxOutboxMessage) => Promise<Product>;
  listProducts: (
    next?: string
  ) => Promise<{ products: Product[]; nextToken?: string }>;
  listProductByCategory: (
    categoryId: string,
    next?: string
  ) => Promise<{ products: Product[]; nextToken?: string }>;
  listProductBySubCategory: (
    subCategoryId: string,
    next?: string
  ) => Promise<{ products: Product[]; nextToken?: string }>;
};
