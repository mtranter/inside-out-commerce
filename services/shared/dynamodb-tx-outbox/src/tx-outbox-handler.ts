import { Kafka, Producer } from "kafkajs";
import { _handler } from "./tx-outbox";
import { envOrThrow } from "./env";

let producer: Producer | undefined;
const getProducer = async (
  brokers: string[],
  username: string,
  password: string
) => {
  if (!producer) {
    producer = new Kafka({
      clientId: "members-service",
      brokers,
      ssl: true,
      sasl: {
        mechanism: "plain",
        username: username,
        password: password,
      },
    }).producer();
    await producer.connect();
  }
  return producer;
};

export const handler = _handler(
  getProducer(
    envOrThrow("KAFKA_BROKERS").split(","),
    envOrThrow("KAFKA_USERNAME"),
    envOrThrow("KAFKA_PASSWORD")
  )
);
