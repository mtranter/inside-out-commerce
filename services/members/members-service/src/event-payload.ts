import { KafkaPayload } from "@inside-out-bank/models";
import { z } from "zod";
import { MemberSchema } from "./schema";

export const MemberPayload = KafkaPayload(MemberSchema);
export type MemberPaylod = z.infer<typeof MemberPayload>

export const MemberPayloadKeySchema = z.string()