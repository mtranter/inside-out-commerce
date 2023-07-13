import { RouteBuilder, HandlersOf } from "@ezapi/router-core";
import { JsonParserMiddlerware } from "@ezapi/json-middleware";
import { ZodMiddleware } from "@ezapi/zod-middleware";
import { CorsMiddleware } from "@ezapi/cors-middleware";
import { z } from "zod";
import { LoggingMiddleware } from "@inside-out-commerce/middleware";
import log from "../../infra/logging";
import { CreateProductRequestSchema, UpdateProductRequestSchema } from "../../domain/catalog-service";


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
    .route("createProduct", "POST", "/", ZodMiddleware(CreateProductRequestSchema))   
    // .route("updateProduct", "PUT", "/{sku}", ZodMiddleware(UpdateProductRequestSchema))
    // .route("deleteProduct", "DELETE", "/{sku}")
    .route("batchCreateProduct", "POST", "/batch", ZodMiddleware(z.array(CreateProductRequestSchema)))   
    .route("getProduct", "GET", "/{sku}")
    .route("listProducts", "GET", "/?{nextToken?}&{pageSize?:int}")
    .route("listProductsByCategory", "GET", "/category/{category}?{nextToken?}&{pageSize?:int}")
    .route(
      "listProductsBySubCategory",
      "GET",
      "/subCategory/{subCategory}?{nextToken?}&{pageSize?:int}"
    );
};
