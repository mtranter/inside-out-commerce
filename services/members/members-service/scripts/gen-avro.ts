import { zodToAvro } from "zod-avsc";
import { MemberPayload, MemberPayloadKeySchema } from "../src/payload";
import fs from "fs";

const namespace = "com.insideoutbank.members";

const avroKeySchema = zodToAvro(
  "MemberCreatedEventKey",
  MemberPayloadKeySchema,
  {
    namespace,
  }
);
const avroValueSchema = zodToAvro("MemberCreatedEvent", MemberPayload, {
  namespace,
});

// create avro folder if it doesn't exist
fs.mkdirSync("./avro", { recursive: true });

// write avro schema to file
fs.writeFileSync(
  "./avro/member-data-value.avsc",
  JSON.stringify(avroValueSchema, null, 2)
);

fs.writeFileSync(
  "./avro/member-data-key.avsc",
  JSON.stringify(avroKeySchema, null, 2)
);
