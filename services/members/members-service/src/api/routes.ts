import { RouteBuilder, Ok } from "@ezapi/router-core";
import { JsonParserMiddlerware } from "@ezapi/json-middleware";
import { ZodMiddleware } from "@ezapi/zod-middleware";
import { CreateMemberSchema } from "./../schema";
import { tableBuilder } from "funamots";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { LoggingMiddleware } from "./middleware/logging-middleware";
import { IdTokenMiddleware, JwtMiddleware } from "./middleware/auth-middleware";
import { TxOutboxMessageFactory } from "./../tx-outbox/tx-outbox";
import { SchemaRegistry } from "@kafkajs/confluent-schema-registry";
import { MemberDto, handlers } from "./api-handlers";

export const routes = ({
  tableName,
  client,
  idTokenEndpoint,
  membersTopic,
  keySchemaId,
  valueSchemaId,
  schemaRegistry,
  testClientId
}: {
  idTokenEndpoint: string;
  tableName: string;
  client: DynamoDB;
  membersTopic: string;
  keySchemaId: number;
  valueSchemaId: number;
  schemaRegistry: SchemaRegistry;
  testClientId: string;
}) => {
  const table = tableBuilder<MemberDto>(tableName)
    .withKey("hk", "sk")
    .build({ client });
  const txOutboxMessageFactory = TxOutboxMessageFactory({
    registry: schemaRegistry,
    topic: membersTopic,
    keySchemaId,
    valueSchemaId,
  });
  const _handlers = handlers(txOutboxMessageFactory, table, testClientId);
  return RouteBuilder.withMiddleware(LoggingMiddleware())
    .withMiddleware(JsonParserMiddlerware())
    .route("GET", "/healthcheck")
    .handle(() => Ok({ status: "OK" }))
    .withMiddleware(JwtMiddleware())
    .withMiddleware(IdTokenMiddleware(idTokenEndpoint))
    .route("POST", "/members", ZodMiddleware(CreateMemberSchema))
    .handle(_handlers.newMemberHandler)
    .route("GET", "/members/{id}")
    .handle(_handlers.getMember)
    .build();
};
