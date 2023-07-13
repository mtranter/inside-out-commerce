import { RouteBuilder, HandlersOf } from "@ezapi/router-core";
import { JsonParserMiddlerware } from "@ezapi/json-middleware";
import { ZodMiddleware } from "@ezapi/zod-middleware";
import { CorsMiddleware } from "@ezapi/cors-middleware";
import { z } from "zod";
import { LoggingMiddleware } from "@inside-out-commerce/middleware";
import log from "../../infra/logging";

export const CreateProductRequest = z.object({
  sku: z.string(),
  name: z.string(),
  description: z.string(),
  shortDescription: z.string(),
  rrp: z.number(),
  categoryId: z.string(),
  category: z.string(),
  subcategory: z.string(),
});

export type RouteHandlers = HandlersOf<ReturnType<typeof routes>>;
const corsMiddleware = CorsMiddleware({
  allowedOrigins: "*",
  allowedMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["*"],
  exposedHeaders: ["*"],
  maxAge: 600,
  allowCredentials: true,
});

export const routes = () => {
  return RouteBuilder.withMiddleware(LoggingMiddleware({ log }))
    .withMiddleware(JsonParserMiddlerware)
    .withMiddleware(corsMiddleware)
    .route("healthcheck", "GET", "/healthcheck")
    .route("createProduct", "POST", "/", ZodMiddleware(CreateProductRequest))   
    .route("batchCreateProduct", "POST", "/batch", ZodMiddleware(z.array(CreateProductRequest)))   
    .route("getProduct", "GET", "/{sku}")
    .route("listProducts", "GET", "/?{nextToken?}")
    .route("listProductsByCategory", "GET", "/category/{category}?{nextToken?}")
    .route(
      "listProductsBySubCategory",
      "GET",
      "/subcategory/{subCategory}?{nextToken?}"
    );
};
