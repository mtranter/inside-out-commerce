import { RouteBuilder, HandlersOf } from "@ezapi/router-core";
import { JsonParserMiddlerware } from "@ezapi/json-middleware";
import { ZodMiddleware } from "@ezapi/zod-middleware";
import {z} from 'zod'
import {
  LoggingMiddleware,
  IdTokenMiddleware,
  JwtMiddleware,
} from "@inside-out-commerce/middleware";
import log from "../../infra/logging";

export const CreateProductRequest = z.object({
  sku: z.string(),
  name: z.string(),
  description: z.string(),
  shortDescription: z.string(),
  rrp: z.number(),
  categoryId: z.string(),
  category: z.string(),
  subCategory: z.string(),
});

export type RouteHandlers = HandlersOf<ReturnType<typeof routes>>;

export const routes = () => {
  return RouteBuilder.withMiddleware(LoggingMiddleware({ log }))
    .withMiddleware(JsonParserMiddlerware)
    .route("healthcheck", "GET", "/healthcheck")
    .route(
      "createProduct",
      "POST",
      "/products",
      ZodMiddleware(CreateProductRequest)
    )
    .route("getProduct", "GET", "/products/{sku}")
    .route("listProductsByCategory", "GET", "/products/category/{category}?{nextToken?}")
    .route("listProductsBySubCategory", "GET", "/products/subcategory/{subCategory}?{nextToken?}")
};
