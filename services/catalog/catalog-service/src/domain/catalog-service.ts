import { v4 as uuidv4 } from "uuid";
import { ProductTopicValuePayload } from "../models";
import { CreateProductRequest } from "../api/routes/routes";
import { z } from "zod";
import { TxOutboxMessageFactory } from "dynamodb-kafka-outbox";
import { ProductRepo } from "../api/handlers";
import log from "../infra/logging";

type Config = {
  keySchemaId: number;
  valueSchemaId: number;
  topic: string;
  batchCreateProductQueueUrl: string;
};

export type CatalogService = ReturnType<typeof CatalogService>;

export const CatalogService = (
  config: Config,
  txOutboxMessageFactory: TxOutboxMessageFactory,
  repo: ProductRepo
) => {
  const createProduct = async (req: z.infer<typeof CreateProductRequest>) => {
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
    const event = await txOutboxMessageFactory.createOutboxMessage(outboxMsgParams);
    await repo.put(req, event);
  };
  return {
    createProduct,
  };
};
