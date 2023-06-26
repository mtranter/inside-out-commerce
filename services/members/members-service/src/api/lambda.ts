import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { restApiHandler } from "@ezapi/aws-rest-api-backend";
import { SchemaRegistry } from "@kafkajs/confluent-schema-registry";
import { routes } from "./routes";
import { Dto, handlers } from "./handlers";
import { config } from "./config";
import { buildRepo } from "./repo";

const schemaRegistry = new SchemaRegistry({
  host: config.schemaRegistryHost,
  auth: {
    username: config.schemaRegistryUsername,
    password: config.schemaRegistryPassword,
  },
});

const _handers = handlers(
  {
    topic: config.membersTopic,
    keySchemaId: config.keySchemaId,
    valueSchemaId: config.valueSchemaId,
  },
  schemaRegistry,
  buildRepo<Dto>({ tableName: config.tableName, client: new DynamoDB({}) })
);

const api = routes(config.idTokenEndpoint, config.testClientId).build(_handers);

export const handler = restApiHandler(api, config.stage);
