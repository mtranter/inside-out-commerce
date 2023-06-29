import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { restApiHandler } from "@ezapi/aws-rest-api-backend";
import { SchemaRegistry } from "@kafkajs/confluent-schema-registry";
import { routes } from "./routes";
import { handlers } from "./handlers";
import { config } from "./config";
import { ProductRepo } from "./../repo";

const schemaRegistry = new SchemaRegistry({
  host: config.schemaRegistryHost,
  auth: {
    username: config.schemaRegistryUsername,
    password: config.schemaRegistryPassword,
  },
});

const _handers = handlers(
  {
    topic: config.productsTopic,
    keySchemaId: config.keySchemaId,
    valueSchemaId: config.valueSchemaId,
  },
  schemaRegistry,
  ProductRepo({ tableName: config.tableName, client: new DynamoDB({}) })
);

const api = routes(config.idTokenEndpoint, config.testClientId).build(_handers);

export const handler = restApiHandler(api, config.stage);
