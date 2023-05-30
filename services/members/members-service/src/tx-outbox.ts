import { DynamoDBStreamHandler } from "aws-lambda";
import { Producer, TopicMessages } from "kafkajs";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { SchemaRegistry } from "@kafkajs/confluent-schema-registry";
import { KafkaPayload } from "@inside-out-bank/models";

export type TxOutboxMessage = {
  topic: string;
  key: string;
  value: string;
};

export const TxOutboxMessageFactory = ({
  registry,
  topic,
  keySchemaId,
  valueSchemaId,
}: {
  registry: SchemaRegistry;
  topic: string;
  keySchemaId: number;
  valueSchemaId: number;
}) => ({
  createOutboxMessage: async <K, V extends KafkaPayload>(
    k: K,
    v: V
  ): Promise<TxOutboxMessage> => {
    const keyP = registry.encode(keySchemaId, k);
    const valueP = registry.encode(valueSchemaId, v);
    const key = await keyP;
    const value = await valueP;
    return {
      topic,
      key: key.toString("base64"),
      value: value.toString("base64"),
    };
  },
});

export const _handler =
  (producerP: Promise<Pick<Producer, "sendBatch">>): DynamoDBStreamHandler =>
  async (e) => {
    const batch = e.Records.reduce<{
      [topic: string]: { key: Buffer | undefined; value: Buffer }[];
    }>((batch, next) => {
      const { NewImage } = next.dynamodb!;
      const object = unmarshall(NewImage as any) as TxOutboxMessage;
      const { topic, key, value } = object;
      const existingBatch = batch[topic] || [];
      const newBatch = {
        ...batch,
        [topic]: [
          ...existingBatch,
          {
            key: key ? Buffer.from(key, "base64") : undefined,
            value: Buffer.from(value, "base64"),
          },
        ],
      };
      return newBatch;
    }, {});

    const topicMessages: TopicMessages[] = Object.entries(batch).map(
      ([topic, messages]) => ({
        topic,
        messages,
      })
    );
    const producer = await producerP;
    await producer.sendBatch({ topicMessages, acks: -1 });
  };
