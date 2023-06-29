import { generateMock } from "@anatine/zod-mock";
import { ProductSchema } from "../../src/models";
import { CreateProductRequest } from "../../src/api/routes/routes";

export const buildTestProduct = () => generateMock(ProductSchema);
export const buildTestProductRequest = () => generateMock(CreateProductRequest);
