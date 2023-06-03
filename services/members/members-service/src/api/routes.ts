import { RouteBuilder, Ok } from "@ezapi/router-core";
import { JsonParserMiddlerware } from "@ezapi/json-middleware";
import { ZodMiddleware } from "@ezapi/zod-middleware";
import { CreateMemberSchema } from "./../schema";
import { LoggingMiddleware } from "./middleware/logging-middleware";
import { IdTokenMiddleware, JwtMiddleware } from "./middleware/auth-middleware";
import { Handlers } from "./api-handlers";

export const routes = (handers: Handlers, idTokenEndpoint: string) => {
  return RouteBuilder.withMiddleware(LoggingMiddleware())
    .withMiddleware(JsonParserMiddlerware())
    .route("GET", "/healthcheck")
    .handle(() => Ok({ status: "OK" }))
    .withMiddleware(JwtMiddleware())
    .withMiddleware(IdTokenMiddleware(idTokenEndpoint))
    .route("POST", "/members", ZodMiddleware(CreateMemberSchema))
    .handle(handers.newMemberHandler)
    .route("GET", "/members/{id}")
    .handle(handers.getMember)
    .build();
};
