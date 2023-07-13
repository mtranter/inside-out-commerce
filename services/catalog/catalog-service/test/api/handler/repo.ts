import { TxOutboxMessage } from "dynamodb-kafka-outbox";
import { Product } from "../../../src/models";
import { ProductRepo } from "./../../../src/api/handlers/repo";

export type MockRepo = ProductRepo & {
  productsState: Record<string, Product>;
  eventsState: TxOutboxMessage[];
  reset: () => void;
};
export const mockRepo = (): MockRepo => {
  let productsState: Record<string, Product> = {};
  let eventsState: TxOutboxMessage[] = [];

  return {
    eventsState,
    productsState,
    reset: () => {
      productsState = {};
      eventsState = [];
    },
    get: async (sku: string) => {
      return productsState[sku];
    },
    listProducts: async (args) => {
      return {
        products: Object.values(productsState),
        nextToken: undefined,
      };
    },
    put: async (product, event) => {
      productsState[product.sku] = product;
      eventsState.push(event);
      return product;
    },
    listProductByCategory: async (categoryId, args) => {
      return {
        products: Object.values(productsState).filter(
          (p) => p.categoryId === categoryId
        ),
        nextToken: undefined,
      };
    },
    listProductBySubCategory: async (subCategoryId: string, args) => {
      return {
        products: Object.values(productsState).filter(
          (p) => p.subCategory === subCategoryId
        ),
        nextToken: undefined,
      };
    },
  };
};
