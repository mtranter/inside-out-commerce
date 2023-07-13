import { SQSHandler } from "aws-lambda";
import { CreateProductRequest } from "./api/routes/routes";
import { config } from "./config";
import { z } from "zod";
import { CatalogService } from "./domain/catalog-service";
import { TxOutboxMessageFactory } from "dynamodb-kafka-outbox";
import { SchemaRegistry } from "@kafkajs/confluent-schema-registry";
import { ProductRepo } from "./repo";
import { DynamoDB } from "@aws-sdk/client-dynamodb";

const schemaRegistry = new SchemaRegistry({
  host: config.schemaRegistryHost,
  auth: {
    username: config.schemaRegistryUsername,
    password: config.schemaRegistryPassword,
  },
});

export const _handler =
  (svc: CatalogService): SQSHandler =>
  async (event) => {
    const failureIds: string[] = [];
    const products = event.Records.map(
      (r) => JSON.parse(r.body) as z.infer<typeof CreateProductRequest>
    );
    for (const product of products) {
      try {
        await svc.createProduct(product);
      } catch (e) {
        failureIds.push(product.sku);
      }
    }
  };

const productRepo = ProductRepo({
  tableName: config.tableName,
  client: new DynamoDB({}),
});

const catalogService = CatalogService(
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

export const handler: SQSHandler = _handler(catalogService);
