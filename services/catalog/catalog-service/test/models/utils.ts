import { generateMock } from "@anatine/zod-mock";
import { ProductSchema } from "../../src/models";
import { CreateProductRequestSchema } from "../../src/domain/catalog-service";

export const buildTestProduct = () => generateMock(ProductSchema);
export const buildTestProductRequest = () => generateMock(CreateProductRequestSchema);
