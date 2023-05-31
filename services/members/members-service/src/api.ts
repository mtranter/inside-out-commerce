import { RouteBuilder, Ok, Middleware, Unauthorized } from "@ezapi/router-core";
import { JsonParserMiddlerware } from "@ezapi/json-middleware";
import { restApiHandler } from "@ezapi/aws-rest-api-backend";
import { ZodMiddleware } from "@ezapi/zod-middleware";
import { CreateMemberSchema, Member } from "./schema";
import { tableBuilder } from "funamots";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { LoggingMiddleware } from "./middleware/logging-middleware";
import { IdTokenMiddleware, JwtMiddleware } from "./middleware/auth-middleware";
import { TxOutboxMessage, TxOutboxMessageFactory } from "./tx-outbox";
import { SchemaRegistry } from "@kafkajs/confluent-schema-registry";
import { envOrThrow } from "./env";

type MemberDto = {
  hk: string;
  sk: string;
  data: Member | TxOutboxMessage;
  isEvent?: true;
};

const routes = ({
  tableName,
  client,
  idTokenEndpoint,
  membersTopic,
  keySchemaId,
  valueSchemaId,
  schemaRegistry,
}: {
  idTokenEndpoint: string;
  tableName: string;
  client: DynamoDB;
  membersTopic: string;
  keySchemaId: number;
  valueSchemaId: number;
  schemaRegistry: SchemaRegistry;
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
  return RouteBuilder.withMiddleware(LoggingMiddleware())
    .withMiddleware(JsonParserMiddlerware())
    .route("GET", "/healthcheck")
    .handle((r) => Ok({ status: "OK" }))
    .withMiddleware(JwtMiddleware())
    .withMiddleware(IdTokenMiddleware(idTokenEndpoint))
    .route("POST", "/members", ZodMiddleware(CreateMemberSchema))
    .handle(async (req) => {
      const id = uuidv4();
      const member: Member = {
        id,
        ...req.safeBody,
        email: req.userInfo.email,
      };
      const dto: MemberDto = {
        hk: `MEMBER#${id}`,
        sk: `#METADATA#`,
        data: member,
      };

      const eventId = uuidv4();
      const event: TxOutboxMessage =
        await txOutboxMessageFactory.createOutboxMessage(id, {
          eventId: eventId,
          eventType: "MEMBER_CREATED",
          eventTime: Date.now(),
          payload: member,
          metadata: {
            traceId: process.env._X_AMZN_TRACE_ID!,
            originator: req.jwt.sub,
          },
        });
      await table.transactPut([
        {
          item: dto,
        },
        {
          item: {
            hk: `MEMBER_CREATED_EVENT#${eventId}`,
            sk: `#METADATA#`,
            data: event,
            isEvent: true,
          },
        },
      ]);
      return Ok({ status: "OK" });
    })
    .build();
};

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
