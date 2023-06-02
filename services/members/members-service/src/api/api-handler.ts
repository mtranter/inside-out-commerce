import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { restApiHandler } from "@ezapi/aws-rest-api-backend";
import { SchemaRegistry } from "@kafkajs/confluent-schema-registry";
import { envOrThrow } from "../env";
import { routes } from "./routes";

const stage = envOrThrow("API_STAGE");
const tableName = envOrThrow("TABLE_NAME");
const membersTopic = envOrThrow("MEMBERS_TOPIC");
const keySchemaId = Number(envOrThrow("KEY_SCHEMA_ID"));
const valueSchemaId = Number(envOrThrow("VALUE_SCHEMA_ID"));
const schemaRegistryHost = envOrThrow("SCHEMA_REGISTRY_HOST");
const schemaRegistryUsername = envOrThrow("SCHEMA_REGISTRY_USERNAME");
const schemaRegistryPassword = envOrThrow("SCHEMA_REGISTRY_PASSWORD");
const idTokenEndpoint = envOrThrow("ID_TOKEN_ENDPOINT");

export const handler = restApiHandler(
  routes({
    tableName,
    client: new DynamoDB({}),
    idTokenEndpoint,
    membersTopic,
    keySchemaId,
    valueSchemaId,
    schemaRegistry: new SchemaRegistry({
      host: schemaRegistryHost,
      auth: {
        username: schemaRegistryUsername,
        password: schemaRegistryPassword,
      },
    }),
  }),
  stage
);
