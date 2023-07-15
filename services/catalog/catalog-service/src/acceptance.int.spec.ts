import { SSM } from "@aws-sdk/client-ssm";
import { Product, ProductSchema } from "./models";
import { generateMock } from "@anatine/zod-mock";
import { Consumer, Kafka } from "kafkajs";
import { SchemaRegistry } from "@kafkajs/confluent-schema-registry";
import { KafkaPayload } from "@inside-out-commerce/models";
import waitForExpect from "wait-for-expect";
import { createSignedFetcher } from "aws-sigv4-fetch";
import { v4 as uuid } from "uuid"
import { CreateProductRequestSchema } from "./domain";

jest.setTimeout(10000);
const ssm = new SSM({
  region: "ap-southeast-2",
});

type ApiConfig = {
  authEndpoint: string;
  clientId: string;
  clientSecret: string;
  apiBaseUrl: string;
};
type KafkaConfig = {
  brokers: string;
  username: string;
  password: string;
  groupId: string;
  topic: string;
};
type SchemaRegistryConfig = {
  host: string;
  username: string;
  password: string;
};

const getSSMValue = async (name: string) =>
  await ssm
    .getParameter({
      Name: name,
      WithDecryption: true,
    })
    .then((r) => r.Parameter?.Value!);
const getJsonConfig = async <T>(name: string): Promise<T> => {
  const json = await getSSMValue(name);
  if (!name) {
    throw new Error(`Expect SSM value for path ${name}`);
  }
  return JSON.parse(json) as T;
};
const getApiConfig = () =>
  getJsonConfig<ApiConfig>(
    "/inside-out-commerce/prod/catalog-service/test-user/api-config"
  );
const getKafkaConfig = () =>
  getJsonConfig<KafkaConfig>(
    "/inside-out-commerce/prod/catalog-service/test-user/kafka-config"
  );
const getSchemaRegistryConfig = () =>
  getJsonConfig<SchemaRegistryConfig>(
    "/inside-out-commerce/prod/catalog-service/test-user/schema-registry-config"
  );

const makeAuthedRequest =
  (cfg: ApiConfig) =>
  async (path: string, method: string, data?: unknown | undefined) => {
    const fetch = createSignedFetcher({
      region: "ap-southeast-2",
      service: "execute-api",
      credentials: {
        accessKeyId: cfg.clientId,
        secretAccessKey: cfg.clientSecret,
      },
    });

    return await fetch(`${cfg.apiBaseUrl}${path}`, {
      method,
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  };

const setupKafkaConsumer = async (
  kafkaCfg: KafkaConfig,
  schemaCfg: SchemaRegistryConfig
) => {
  const consumer = new Kafka({
    clientId: "catalog-service",
    brokers: kafkaCfg.brokers.split(","),
    ssl: true,
    sasl: {
      mechanism: "plain",
      username: kafkaCfg.username,
      password: kafkaCfg.password,
    },
  }).consumer({ groupId: kafkaCfg.groupId });
  const schemaRegistry = new SchemaRegistry({
    host: schemaCfg.host,
    auth: {
      username: schemaCfg.username,
      password: schemaCfg.password,
    },
  });
  await consumer.connect();
  await consumer.subscribe({
    topic: kafkaCfg.topic,
    fromBeginning: false,
  });
  const messages: unknown[] = [];
  const runPromise = consumer.run({
    autoCommit: true,
    eachMessage: async ({ message }) => {
      const response = await schemaRegistry.decode(message.value!);
      messages.push(response);
    },
  });
  return { consumer, messages, runPromise };
};

describe("Product API", () => {
  let apiConfig: ApiConfig;
  let kafkaConfig: KafkaConfig;
  let schemaRegistryConfig: SchemaRegistryConfig;
  beforeAll(async () => {
    const apiConfigP = getApiConfig();
    const kafkaConfigP = getKafkaConfig();
    const schemaRegsitryConfigP = getSchemaRegistryConfig();
    const [api, kafka, schemaReg] = await Promise.all([
      apiConfigP,
      kafkaConfigP,
      schemaRegsitryConfigP,
    ]);
    apiConfig = api;
    kafkaConfig = kafka;
    schemaRegistryConfig = schemaReg;
    console.log(
      JSON.stringify({
        apiConfig,
        kafkaConfig,
        schemaRegistryConfig,
      })
    );
  });
  describe("healthcheck endpoint", () => {
    it("should return 200", async () => {
      const _makeRequest = makeAuthedRequest(apiConfig);
      const response = await _makeRequest("/catalog/healthcheck", "GET");
      expect(response.status).toEqual(200);
    });
  });
  describe("create Product endpoint", () => {
    const product = generateMock(CreateProductRequestSchema, {
      stringMap: {
        sku: () => uuid(),
      }
    });
    let response: Response;
    let consumer: Consumer;
    let kafkaMessages: unknown[];
    beforeAll(async () => {
      const _makeRequest = makeAuthedRequest(apiConfig);
      const { consumer: _consumer, messages } = await setupKafkaConsumer(
        kafkaConfig,
        schemaRegistryConfig
      );
      await new Promise((resolve) => setTimeout(resolve, 3000));
      kafkaMessages = messages;
      consumer = _consumer;
      response = await _makeRequest("/catalog", "POST", product);
    });
    afterAll(async () => {
      await consumer?.disconnect();
    });
    it("should return 200", () => {
      expect(response.status).toEqual(201);
    });
    it("should have returned a product and published it to kafka", async () => {
      const returnedProduct = (await response.json()) as Product;
      expect(returnedProduct).toMatchObject(product);
      const _makeRequest = makeAuthedRequest(apiConfig);
      const getResponse = await _makeRequest(
        `/catalog/${returnedProduct.sku}`,
        "GET"
      );
      const fetchedProduct = await getResponse.json();
      expect(fetchedProduct).toEqual(returnedProduct);
      const findProduct = () => {
        return kafkaMessages.find((e) => {
          const event = e as KafkaPayload<typeof ProductSchema>;
          const payload = event.payload as Product;
          if (payload) {
            return payload.sku === returnedProduct.sku;
          } else {
            return false;
          }
        });
      };
      return waitForExpect(
        () => {
          const product = findProduct();
          expect(product).toBeDefined();
        },
        5000,
        500
      );
    });
  });
  describe("batch create Product endpoint", () => {
    const product = generateMock(CreateProductRequestSchema, {
      stringMap: {
        sku: () => uuid(),
      }
    });
    let response: Response;
    let consumer: Consumer;
    let kafkaMessages: unknown[];
    beforeAll(async () => {
      const _makeRequest = makeAuthedRequest(apiConfig);
      const { consumer: _consumer, messages } = await setupKafkaConsumer(
        kafkaConfig,
        schemaRegistryConfig
      );
      await new Promise((resolve) => setTimeout(resolve, 3000));
      kafkaMessages = messages;
      consumer = _consumer;
      response = await _makeRequest("/catalog/batch", "POST", [product]);
    });
    afterAll(async () => {
      await consumer?.disconnect();
    });
    it("should return 200", () => {
      expect(response.status).toEqual(202);
    });
    it("should have published the message to kafka", async () => {
      const findProduct = () => {
        return kafkaMessages.find((e) => {
          const event = e as KafkaPayload<typeof ProductSchema>;
          const payload = event.payload as Product;
          if (payload) {
            return payload.sku === product.sku;
          } else {
            return false;
          }
        });
      };
      return waitForExpect(
        () => {
          const product = findProduct();
          expect(product).toBeDefined();
        },
        5000,
        500
      );
    });
  });
});
