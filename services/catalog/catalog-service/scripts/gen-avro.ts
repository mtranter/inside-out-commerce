import { zodToAvro } from "zod-avsc";
import {
  ProductTopicValuePayloadSchema,
  ProductTopicKeyPayloadSchema,
} from "../src/models";
import fs from "fs";

const namespace = "com.insideoutcommerce.catalog";

const avroKeySchema = zodToAvro(
  "ProductEventKey",
  ProductTopicKeyPayloadSchema,
  {
    namespace,
  }
);
const avroValueSchema = zodToAvro(
  "ProductEventValue",
  ProductTopicValuePayloadSchema,
  {
    namespace,
  }
);

// create avro folder if it doesn't exist
fs.mkdirSync("./avro", { recursive: true });

// write avro schema to file
fs.writeFileSync(
  "./avro/product-data-value.avsc",
  JSON.stringify(avroValueSchema, null, 2)
);

fs.writeFileSync(
  "./avro/product-data-key.avsc",
  JSON.stringify(avroKeySchema, null, 2)
);
