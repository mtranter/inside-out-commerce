import { KafkaPayload } from "@inside-out-commerce/models";
import { z } from "zod";

export const ProductSchema = z.object({
    sku: z.string(),
    name: z.string(),
    description: z.string(),
    shortDescription: z.string(),
    rrp: z.number(),
    categoryId: z.string(),
    category: z.string(),
    subcategory: z.string()
});

export type Product = z.infer<typeof ProductSchema>;
export const ProductTopicKeyPayloadSchema = z.string();
export const ProductTopicValuePayloadSchema = KafkaPayload(ProductSchema);

export type ProductTopicKeyPayload = z.infer<typeof ProductTopicKeyPayloadSchema>;
export type ProductTopicValuePayload = z.infer<typeof ProductTopicValuePayloadSchema>;