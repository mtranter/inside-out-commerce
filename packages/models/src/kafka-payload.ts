import { ZodType, z } from "zod";

export const KafkaPayload = <T extends ZodType>(t: T) =>
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

class DummyWrapper<T extends ZodType> {
  wrap(t: T) {
    return KafkaPayload(t);
  }
}

export type KafkaPayload<T extends ZodType> = z.infer<
  ReturnType<DummyWrapper<T>["wrap"]>
>;
