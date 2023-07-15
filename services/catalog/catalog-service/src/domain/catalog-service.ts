import { TxOutboxMessageFactory } from "dynamodb-kafka-outbox";
import { ProductRepo } from "../repo";
import { Config, CreateProductRequest, UpdateProductRequest } from "./types";
import { generateEvent } from "./utils";

export type CatalogService = ReturnType<typeof CatalogService>;
export const CatalogService = (
  config: Config,
  txOutboxMessageFactory: TxOutboxMessageFactory,
  repo: ProductRepo
) => {
  const createProduct = async (req: CreateProductRequest) => {
    const event = await generateEvent(
      "com.insideout.product.created",
      req.sku,
      req,
      config,
      txOutboxMessageFactory
    );
    await repo.put(req, event);
  };
  const updateProduct = async (sku: string, req: UpdateProductRequest) => {
    const existing = await repo.get(sku);
    if (!existing) {
      return { error: "ProductNotFound" } as const;
    }
    const updated = { ...existing, ...req };
    const event = await generateEvent(
      "com.insideout.product.updated",
      sku,
      updated,
      config,
      txOutboxMessageFactory
    );

    await repo.put(updated, event);
    return true;
  };
  const deleteProduct = async (sku: string) => {
    const existing = await repo.get(sku);
    if (!existing) {
      return { error: "ProductNotFound" } as const;
    }

    const event = await generateEvent(
      "com.insideout.product.deleted",
      sku,
      existing,
      config,
      txOutboxMessageFactory
    );

    await repo.delete(sku, event);
    return true;
  };

  return {
    createProduct,
    updateProduct,
    deleteProduct,
  };
};
