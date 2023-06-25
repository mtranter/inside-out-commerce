import { RouteBuilder, Ok, HandlersOf } from "@ezapi/router-core";
import { JsonParserMiddlerware } from "@ezapi/json-middleware";
import { ZodMiddleware } from "@ezapi/zod-middleware";
import { CreateMemberSchema } from "./../schema";
import {
  LoggingMiddleware,
  IdTokenMiddleware,
  JwtMiddleware,
} from "@inside-out-bank/middleware";
import log from "../logging";

export type RouteHandlers = HandlersOf<ReturnType<typeof routes>>;

export const routes = (
  idTokenEndpoint: string,
  testCognitoClientId: string
) => {
  return RouteBuilder.withMiddleware(LoggingMiddleware({log}))
    .withMiddleware(JsonParserMiddlerware)
    .route("healthcheck", "GET", "/healthcheck")
    .withMiddleware(JwtMiddleware({testClientId: testCognitoClientId, log}))
    .withMiddleware(IdTokenMiddleware({userInfoEndpoint: idTokenEndpoint, log}))
    .route(
      "createMember",
      "POST",
      "/members",
      ZodMiddleware(CreateMemberSchema)
    )
    .route("getMemberById", "GET", "/members/{id}");
};
