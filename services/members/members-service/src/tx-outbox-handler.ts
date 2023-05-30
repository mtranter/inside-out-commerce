import { Kafka, Producer } from "kafkajs";
import { _handler } from "./tx-outbox";
import { envOrThrow } from "./env";

let producer: Producer | undefined;
const getProducer = async (brokers: string[]) => {
  if (!producer) {
    producer = new Kafka({
      clientId: "members-service",
      brokers,
    }).producer();
    await producer.connect();
  }
  return producer;
};

export const handler = _handler(
  getProducer(envOrThrow("KAFKA_BROKERS").split(","))
);
