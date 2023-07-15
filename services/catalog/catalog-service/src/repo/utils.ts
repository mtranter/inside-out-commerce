import { DynamoObject } from "funamots";

export const buildProductHashKey = (sku: string) => `PRODUCT#${sku}`;
export const buildProductSortKey = () => "#PRODUCT#";
export const buildEventHashKey = (sku: string) => `EVENT#${sku}`;
export const buildEventSortKey = () => `#EVENT#${Date.now()}`;
export const buildProductKey = (sku: string) => ({
  hk: buildProductHashKey(sku),
  sk: buildProductSortKey(),
});
export const buildEventKey = (sku: string) => ({
  hk: buildEventHashKey(sku),
  sk: buildEventSortKey(),
});
export const base64EncodeObject = (o: DynamoObject) => {
  return Buffer.from(JSON.stringify(o)).toString("base64");
};

export const decodeBase64Object = (s: string): DynamoObject => {
  return JSON.parse(Buffer.from(s, "base64").toString("utf-8"));
};

export const getListOptions = (args?: {
  nextToken?: string;
  pageSize?: number;
}) => {
  const startKey = args?.nextToken
    ? decodeBase64Object(args?.nextToken)
    : undefined;
  const pageSize = args?.pageSize ?? 20;
  return { startKey, pageSize };
};
