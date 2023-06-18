import { SSM } from "@aws-sdk/client-ssm";
import { CreateMemberSchema, Member } from "./schema";
import { generateMock } from "@anatine/zod-mock";
import { Consumer, Kafka } from "kafkajs";
import { SchemaRegistry } from "@kafkajs/confluent-schema-registry";
import { KafkaPayload } from "@inside-out-bank/models";
import waitForExpect from "wait-for-expect";

jest.setTimeout(10000);
const ssm = new SSM({
  region: "ap-southeast-2",
});

type ApiConfig = {
  authEndpoint: string;
  clientId: string;
  clientSecret: string;
  apiBaseUrl: string;
  scope: string;
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
    "/inside-out-bank/prod/members-service/test-user/api-config"
  );
const getKafkaConfig = () =>
  getJsonConfig<KafkaConfig>(
    "/inside-out-bank/prod/members-service/test-user/kafka-config"
  );
const getSchemaRegistryConfig = () =>
  getJsonConfig<SchemaRegistryConfig>(
    "/inside-out-bank/prod/members-service/test-user/schema-registry-config"
  );

const makeAuthedRequest =
  (cfg: ApiConfig) =>
  async (path: string, method: string, data?: unknown | undefined) => {
    const jwtEndpoint = `${cfg.authEndpoint}/oauth2/token`;
    const token = (await fetch(jwtEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        authorization:
          "Basic " +
          Buffer.from(`${cfg.clientId}:${cfg.clientSecret}`).toString("base64"),
      },
      body: `grant_type=client_credentials&client_id=${cfg.clientId}&scope=${cfg.scope}`,
    })
      .then((r) => r.json())
      .catch((e) => {
        console.error(e);
        throw e;
      })) as { access_token: string };
    const idToken = token.access_token;
    return await fetch(`${cfg.apiBaseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${idToken}`,
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
    clientId: "members-service",
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

describe("Members API", () => {
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
    console.log(JSON.stringify({
      apiConfig,
      kafkaConfig,
      schemaRegistryConfig
    }))
  });
  describe("healthcheck endpoint", () => {
    it("should return 200", async () => {
      const _makeRequest = makeAuthedRequest(apiConfig);
      const response = await _makeRequest("/healthcheck", "GET");
      expect(response.status).toEqual(200);
    });
  });
  describe("create member endpoint", () => {
    const user = generateMock(CreateMemberSchema);
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
      response = await _makeRequest(
        "/members",
        "POST",
        user
      );
    });
    afterAll(async () => {
      await consumer?.disconnect();
    });
    it("should return 200", () => {
      expect(response.status).toEqual(201);
    });
    it("should have returned a member and published it to kafka", async () => {
      const returnedMember = (await response.json()) as Member;
      expect(returnedMember).toMatchObject(user);
      const _makeRequest = makeAuthedRequest(apiConfig);
      const getResponse = await _makeRequest(
        `/members/${returnedMember.id}`,
        "GET"
      );
      const fetchedMember = await getResponse.json();
      expect(fetchedMember).toEqual(returnedMember);
      const findMember = () => {
        return kafkaMessages.find((e) => {
          const event = e as KafkaPayload;
          const payload = event.payload as Member;
          if (payload) {
            return payload.id === returnedMember.id;
          } else {
            return false;
          }
        });
      };
      return waitForExpect(
        () => {
          const member = findMember();
          expect(member).toBeDefined();
        },
        5000,
        500
      );
    });
  });
});
