import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { config } from "./config";
import { ProductRepo } from "./repo";
import { SchemaRegistry } from "@kafkajs/confluent-schema-registry";
import { CatalogService } from "./domain/catalog-service";
import { TxOutboxMessageFactory } from "dynamodb-kafka-outbox";

export const schemaRegistry = new SchemaRegistry({
  host: config.schemaRegistryHost,
  auth: {
    username: config.schemaRegistryUsername,
    password: config.schemaRegistryPassword,
  },
});

export const productRepo = ProductRepo({
  tableName: config.tableName,
  client: new DynamoDB({}),
});

export const catalogService = CatalogService(
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
  );
  