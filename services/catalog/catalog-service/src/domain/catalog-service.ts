import { v4 as uuidv4 } from "uuid";
import { ProductTopicValuePayload } from "../models";
import { z } from "zod";
import { TxOutboxMessageFactory } from "dynamodb-kafka-outbox";
import log from "../infra/logging";
import { ProductRepo } from "../repo";

type Config = {
  keySchemaId: number;
  valueSchemaId: number;
  topic: string;
  batchCreateProductQueueUrl: string;
};

export const CreateProductRequestSchema = z.object({
  sku: z.string(),
  name: z.string(),
  description: z.string(),
  shortDescription: z.string(),
  rrp: z.number(),
  categoryId: z.string(),
  category: z.string(),
  subCategory: z.string(),
});
export type CreateProductRequest = z.infer<typeof CreateProductRequestSchema>;

export const UpdateProductRequestSchema = CreateProductRequestSchema.omit({
  sku: true,
}).deepPartial();
export type UpdateProductRequest = z.infer<typeof UpdateProductRequestSchema>;
export type CatalogService = ReturnType<typeof CatalogService>;

export const CatalogService = (
  config: Config,
  txOutboxMessageFactory: TxOutboxMessageFactory,
  repo: ProductRepo
) => {
  const createProduct = async (req: CreateProductRequest) => {
    const eventId = uuidv4();
    const eventBody: ProductTopicValuePayload = {
      eventId: eventId,
      eventTime: Date.now(),
      eventType: "com.insideout.product.created",
      payload: req,
      metadata: {
        traceId: process.env._X_AMZN_TRACE_ID || "",
      },
    };
    const outboxMsgParams = {
      topic: config.topic,
      key: req.sku,
      keySchemaId: config.keySchemaId,
      valueSchemaId: config.valueSchemaId,
      value: eventBody,
    };
    log.info("outboxMsgParams", outboxMsgParams);
    const event = await txOutboxMessageFactory.createOutboxMessage(
      outboxMsgParams
    );
    await repo.put(req, event);
  };
  const updateProduct = async (sku: string, req: UpdateProductRequest) => {
    const eventId = uuidv4();
    const existing = await repo.get(sku);
    if (!existing) {
      return { error: "ProductNotFound" } as const;
    }
    const updated = { ...existing, ...req };
    const eventBody: ProductTopicValuePayload = {
      eventId: eventId,
      eventTime: Date.now(),
      eventType: "com.insideout.product.updated",
      payload: updated,
      metadata: {
        traceId: process.env._X_AMZN_TRACE_ID || "",
      },
    };
    const outboxMsgParams = {
      topic: config.topic,
      key: sku,
      keySchemaId: config.keySchemaId,
      valueSchemaId: config.valueSchemaId,
      value: eventBody,
    };
    log.info("outboxMsgParams", outboxMsgParams);
    const event = await txOutboxMessageFactory.createOutboxMessage(
      outboxMsgParams
    );
    await repo.put(updated, event);
    return true;
  };
  const deleteProduct = async (sku: string) => {
    const existing = await repo.get(sku);
    if (!existing) {
      return { error: "ProductNotFound" } as const;
    }
    const eventId = uuidv4();
    const eventBody: ProductTopicValuePayload = {
      eventId: eventId,
      eventTime: Date.now(),
      eventType: "com.insideout.product.deleted",
      payload: existing,
      metadata: {
        traceId: process.env._X_AMZN_TRACE_ID || "",
      },
    };
    const outboxMsgParams = {
      topic: config.topic,
      key: sku,
      keySchemaId: config.keySchemaId,
      valueSchemaId: config.valueSchemaId,
      value: eventBody,
    };
    log.info("outboxMsgParams", outboxMsgParams);
    const event = await txOutboxMessageFactory.createOutboxMessage(
      outboxMsgParams
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
