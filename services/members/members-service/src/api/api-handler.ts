import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { restApiHandler } from "@ezapi/aws-rest-api-backend";
import { SchemaRegistry } from "@kafkajs/confluent-schema-registry";
import { envOrThrow } from "../env";
import { routes } from "./routes";
import { tableBuilder } from "funamots";
import { MemberDto, handlers } from "./api-handlers";
import { TxOutboxMessageFactory } from "../tx-outbox/tx-outbox";
import log from "../logging";

const stage = envOrThrow("API_STAGE");
const tableName = envOrThrow("TABLE_NAME");
const membersTopic = envOrThrow("MEMBERS_TOPIC");
const keySchemaId = Number(envOrThrow("KEY_SCHEMA_ID"));
const valueSchemaId = Number(envOrThrow("VALUE_SCHEMA_ID"));
const schemaRegistryHost = envOrThrow("SCHEMA_REGISTRY_HOST");
const schemaRegistryUsername = envOrThrow("SCHEMA_REGISTRY_USERNAME");
const schemaRegistryPassword = envOrThrow("SCHEMA_REGISTRY_PASSWORD");
const idTokenEndpoint = envOrThrow("ID_TOKEN_ENDPOINT");
const testClientId = envOrThrow("TEST_CLIENT_ID");

log.info("Starting API with config", {
  stage,
  tableName,
  membersTopic,
  keySchemaId,
  valueSchemaId,
  schemaRegistryHost,
  schemaRegistryUsername,
  idTokenEndpoint,
  testClientId,
});


const table = tableBuilder<MemberDto>(tableName)
  .withKey("hk", "sk")
  .build({ client: new DynamoDB({}) });
const txOutboxMessageFactory = TxOutboxMessageFactory({
  registry: new SchemaRegistry({
    host: schemaRegistryHost,
    auth: {
      username: schemaRegistryUsername,
      password: schemaRegistryPassword,
    },
  }),
  topic: membersTopic,
  keySchemaId,
  valueSchemaId,
});
const _handers = handlers(txOutboxMessageFactory, table);

export const handler = restApiHandler(routes(_handers, idTokenEndpoint, testClientId), stage);
