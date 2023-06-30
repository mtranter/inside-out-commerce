import { Ok, Created, NotFound } from "@ezapi/router-core";
import { v4 as uuidv4 } from "uuid";
import { TxOutboxMessageFactory, TxOutboxMessage } from "dynamodb-kafka-outbox";
import { RouteHandlers } from "../routes";
import { SchemaRegistry } from "@kafkajs/confluent-schema-registry";
import { ProductRepo } from ".";
import { Product, ProductSchema, ProductTopicValuePayload } from "../../models";

type Config = {
  keySchemaId: number;
  valueSchemaId: number;
  topic: string;
};

export const handlers = (
  { keySchemaId, valueSchemaId, topic }: Config,
  schemaRegistry: Pick<SchemaRegistry, "encode">,
  repo: ProductRepo
): RouteHandlers => {
  const txOutboxMessageFactory = TxOutboxMessageFactory({
    registry: schemaRegistry,
  });

  return {
    healthcheck: async () => Ok({ status: "ok" }),
    createProduct: async (req) => {
      const eventId = uuidv4();
      const eventBody: ProductTopicValuePayload = {
        eventId: eventId,
        eventTime: Date.now(),
        eventType: "com.insideout.product.created",
        payload: req.safeBody,
        metadata: {
          traceId: process.env._X_AMZN_TRACE_ID || "",
          parentEventId: "",
          originator: req.jwt.sub,
        },
      };
      const event = await txOutboxMessageFactory.createOutboxMessage({
        topic,
        key: uuidv4(),
        keySchemaId,
        valueSchemaId,
        value: eventBody
      });
      await repo.put(req.safeBody, event);
      return Created(req.safeBody, `/products/${req.safeBody.sku}`);
    },
    getProduct: async (req) => {
      const product = await repo.get(req.pathParams.sku);
      if (!product) {
        return NotFound(`Product with sku ${req.pathParams.sku} not found`);
      }
      return Ok(product);
    },
    listProductsByCategory: async (req) => {
      const products = await repo.listProductByCategory(req.pathParams.category, req.queryParams.nextToken);
      return Ok(products);
    },
    listProductsBySubCategory: async (req) => {
      const products = await repo.listProductBySubCategory(req.pathParams.subCategory, req.queryParams.nextToken);
      return Ok(products);
    }
  };
};
