import { Ok, Handler } from "@ezapi/router-core";
import { CreateMember, Member } from "./schema";
import { Table } from "funamots";
import { v4 as uuidv4 } from "uuid";
import { IdTokenClaims, JwtClaims } from "./middleware/auth-middleware";
import { TxOutboxMessage, TxOutboxMessageFactory } from "./tx-outbox";

export type MemberDto = {
  hk: string;
  sk: string;
  data: Member | TxOutboxMessage;
  isEvent?: true;
};

export const handlers = (
  txOutboxMessageFactory: TxOutboxMessageFactory,
  table: Pick<Table<MemberDto, "hk", "sk", {}>, "transactPut">
): {
  newMemberHandler: Handler<
    "/members",
    { userInfo: Pick<IdTokenClaims, 'email'>; safeBody: CreateMember; jwt: JwtClaims },
    unknown
  >;
} => ({
  newMemberHandler: async (req) => {
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
  },
});
