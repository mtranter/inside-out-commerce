import { Ok, Created, NotFound } from "@ezapi/router-core";
import { Member } from "./../schema";
import { Table } from "funamots";
import { v4 as uuidv4 } from "uuid";
import { TxOutboxMessageFactory } from "dynamodb-kafka-outbox";
import { RouteHandlers } from "./../routes";
import { TxOutboxMessage } from "dynamodb-kafka-outbox/dist/tx-outbox";
import type { MemberPaylodT } from "./../schema";
import { SchemaRegistry } from "@kafkajs/confluent-schema-registry";

export type EventDto = {
  hk: string;
  sk: string;
  isEvent: true;
} & TxOutboxMessage;

export type MemberDto = {
  hk: string;
  sk: string;
  data: Member;
};

export type Dto = MemberDto | EventDto;

type Config = {
  keySchemaId: number;
  valueSchemaId: number;
  topic: string;
};

export const handlers = (
  { keySchemaId, valueSchemaId, topic }: Config,
  schemaRegistry: Pick<SchemaRegistry,'encode'>,
  table: Pick<Table<Dto, "hk", "sk", {}>, "transactPut" | "get">
): RouteHandlers => {
  const txOutboxMessageFactory = TxOutboxMessageFactory({
    registry: schemaRegistry,
  });

  return {
    healthcheck: async () => Ok({ status: "ok" }),
    getMemberById: async (req) => {
      const memberId = req.pathParams.id;
      const member = await table.get({
        hk: `MEMBER#${memberId}`,
        sk: `#METADATA#`,
      });
      if (member) {
        return Ok((member as MemberDto).data as Member);
      } else {
        return NotFound({ message: `Member ${memberId} not found` });
      }
    },
    createMember: async (req) => {
      const id = uuidv4();
      const member: Member = {
        id,
        ...req.safeBody,
        isTestMember: req.jwt.isTestClient,
        email: req.userInfo.email,
      };
      const dto: MemberDto = {
        hk: `MEMBER#${id}`,
        sk: `#METADATA#`,
        data: member,
      };

      const eventId = uuidv4();
      const eventPayload: MemberPaylodT = {
        eventId: eventId,
        eventType: "MEMBER_CREATED",
        eventTime: Date.now(),
        payload: member,
        metadata: {
          traceId: process.env._X_AMZN_TRACE_ID!,
          originator: req.jwt.sub,
          parentEventId: null as any,
        },
      };
      const event: TxOutboxMessage =
        await txOutboxMessageFactory.createOutboxMessage({
          key: id,
          topic,
          keySchemaId,
          valueSchemaId,
          value: eventPayload,
        });
      await table.transactPut([
        {
          item: dto,
        },
        {
          item: {
            hk: `MEMBER_CREATED_EVENT#${id}`,
            sk: `#EVENT#${eventId}`,
            ...event
          },
        },
      ]);
      return Created(member, `/members/${id}`);
    },
  };
};
