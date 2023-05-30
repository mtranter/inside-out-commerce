import { ZodObject, ZodRawShape, z } from "zod";

export const KafkaPayload = <PL extends ZodRawShape, T extends ZodObject<PL>>(
  t: T
) =>
  z.object({
    eventId: z.string(),
    eventType: z.string(),
    eventTime: z.number(),
    payload: t,
    metadata: z.object({
      traceId: z.string(),
      parentEventId: z.string().optional(),
      originator: z.string().optional(),
    }),
  });

const SomeType = KafkaPayload(z.object({}))
export type KafkaPayload = z.infer<typeof SomeType>;