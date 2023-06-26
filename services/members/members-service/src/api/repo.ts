import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoObject, tableBuilder } from "funamots";
import { TxOutboxMessage } from "dynamodb-kafka-outbox/dist/tx-outbox";
import { Member } from "./schema";

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

export const buildRepo = <T extends Dto & DynamoObject>({
  tableName,
  client,
}: {
  tableName: string;
  client?: DynamoDB;
}) =>
  tableBuilder<T>(tableName)
    .withKey("hk", "sk")
    .build({ client: client ?? new DynamoDB({}) });
