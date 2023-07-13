const envOrThrow = (name: string) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
};

const stage = envOrThrow("API_STAGE");
const tableName = envOrThrow("TABLE_NAME");
const productsTopic = envOrThrow("EVENTS_TOPIC");
const keySchemaId = Number(envOrThrow("KEY_SCHEMA_ID"));
const valueSchemaId = Number(envOrThrow("VALUE_SCHEMA_ID"));
const schemaRegistryHost = envOrThrow("SCHEMA_REGISTRY_HOST");
const schemaRegistryUsername = envOrThrow("SCHEMA_REGISTRY_USERNAME");
const schemaRegistryPassword = envOrThrow("SCHEMA_REGISTRY_PASSWORD");
const batchCreateProductQueueUrl = envOrThrow("BATCH_CREATE_PRODUCT_QUEUE_URL");


export const config = {
  stage,
  tableName,
  productsTopic,
  keySchemaId,
  valueSchemaId,
  schemaRegistryHost,
  schemaRegistryUsername,
  schemaRegistryPassword,
  batchCreateProductQueueUrl
};
