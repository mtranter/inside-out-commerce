import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { restApiHandler } from "@ezapi/aws-rest-api-backend";
import { SchemaRegistry } from "@kafkajs/confluent-schema-registry";
import { routes } from "./routes";
import { handlers } from "./handlers";
import { config } from "../config";
import { ProductRepo } from "./../repo";
import { ApiBuilder } from "@ezapi/router-core";
import { SQS } from "@aws-sdk/client-sqs";
import { CatalogService } from "../domain/catalog-service";
import { TxOutboxMessageFactory } from "dynamodb-kafka-outbox";

const schemaRegistry = new SchemaRegistry({
  host: config.schemaRegistryHost,
  auth: {
    username: config.schemaRegistryUsername,
    password: config.schemaRegistryPassword,
  },
});
const productRepo = ProductRepo({
  tableName: config.tableName,
  client: new DynamoDB({}),
});

const _handers = handlers(
  productRepo,
  new SQS({ region: process.env.AWS_REGION || "local" }),
  CatalogService(
    {
      topic: config.productsTopic,
      keySchemaId: config.keySchemaId,
      valueSchemaId: config.valueSchemaId,
      batchCreateProductQueueUrl: config.batchCreateProductQueueUrl,
    },
    TxOutboxMessageFactory({
      registry: schemaRegistry,
    }),
    productRepo
  )
);

const api = ApiBuilder.build({ "/catalog": routes().build(_handers) });

export const handler = restApiHandler(api, config.stage);
