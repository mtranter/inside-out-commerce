import { DynamoDBStreamHandler } from "aws-lambda";
import { IHeaders, Producer, TopicMessages } from "kafkajs";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { SchemaRegistry } from "@kafkajs/confluent-schema-registry";

export type TxOutboxMessage = {
  topic: string;
  key?: string;
  value: string;
  partition?: number;
  headers?: Record<string, string>;
  timestamp?: string;
};

export type TxOutboxMessageFactory = ReturnType<typeof TxOutboxMessageFactory>;

export const TxOutboxMessageFactory = ({
  registry,
}: {
  registry: Pick<SchemaRegistry, "encode">;
}) => ({
  createOutboxMessage: async <K, V>({
    key,
    value,
    headers,
    partition,
    timestamp,
    topic,
    keySchemaId,
    valueSchemaId,
  }: {
    key?: K;
    value: V;
    headers?: Record<string, string>;
    partition?: number;
    timestamp?: string;
    topic: string;
    keySchemaId: number;
    valueSchemaId: number;
  }): Promise<TxOutboxMessage> => {
    const keyP = key ? registry.encode(keySchemaId, key) : undefined;
    const valueP = registry.encode(valueSchemaId, value);
    const keyBinary = keyP ? await keyP : undefined;
    const valueBinary = await valueP;
    return {
      topic,
      key: keyBinary?.toString("base64"),
      value: valueBinary.toString("base64"),
      headers,
      partition,
      timestamp,
    };
  },
});

export const _handler =
  (producerP: Promise<Pick<Producer, "sendBatch">>): DynamoDBStreamHandler =>
  async (e) => {
    const batch = e.Records.reduce<{
      [topic: string]: {
        key: Buffer | undefined;
        value: Buffer;
        headers?: IHeaders;
      }[];
    }>((batch, next) => {
      const { NewImage } = next.dynamodb!;
      const object = unmarshall(NewImage as any) as { data: TxOutboxMessage };
      const { topic, key, value, headers } = object.data;
      const existingBatch = batch[topic] || [];
      const newBatch = {
        ...batch,
        [topic]: [
          ...existingBatch,
          {
            key: key ? Buffer.from(key, "base64") : undefined,
            value: Buffer.from(value, "base64"),
            headers,
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
