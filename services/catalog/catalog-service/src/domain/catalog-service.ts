import { v4 as uuidv4 } from "uuid";
import { ProductTopicValuePayload } from "../models";
import { CreateProductRequest } from "../api/routes/routes";
import { z } from "zod";
import { TxOutboxMessageFactory } from "dynamodb-kafka-outbox";
import { ProductRepo } from "../api/handlers";

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
    const event = await txOutboxMessageFactory.createOutboxMessage({
      topic: config.topic,
      key: uuidv4(),
      keySchemaId: config.keySchemaId,
      valueSchemaId: config.valueSchemaId,
      value: eventBody,
    });
    await repo.put(req, event);
  };
  return {
    createProduct,
  };
};
