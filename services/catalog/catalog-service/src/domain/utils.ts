import { v4 as uuidv4 } from "uuid";
import { TxOutboxMessageFactory } from "dynamodb-kafka-outbox";
import { Config } from "./types";
import { ProductTopicValuePayload } from "../models";
import log from "../infra/logging";

export const generateEvent = async (
  eventType: string,
  sku: string,
  payload: any,
  config: Config,
  txOutboxMessageFactory: TxOutboxMessageFactory
) => {
  const eventId = uuidv4();
  const eventBody: ProductTopicValuePayload = {
    eventId,
    eventTime: Date.now(),
    eventType,
    payload,
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
  return await txOutboxMessageFactory.createOutboxMessage(outboxMsgParams);
};
