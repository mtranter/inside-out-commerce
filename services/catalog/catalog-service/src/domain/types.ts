import { z } from "zod";
import { CatalogService } from "./catalog-service";

export type Config = {
  keySchemaId: number;
  valueSchemaId: number;
  topic: string;
  batchCreateProductQueueUrl: string;
};

export const CreateProductRequestSchema = z.object({
  sku: z.string(),
  name: z.string(),
  description: z.string(),
  shortDescription: z.string(),
  rrp: z.number(),
  categoryId: z.string(),
  category: z.string(),
  subCategory: z.string(),
});
export type CreateProductRequest = z.infer<typeof CreateProductRequestSchema>;

export const UpdateProductRequestSchema = CreateProductRequestSchema.omit({
  sku: true,
}).deepPartial();
export type UpdateProductRequest = z.infer<typeof UpdateProductRequestSchema>;
