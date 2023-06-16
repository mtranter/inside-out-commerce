import { RouteBuilder, Ok, HandlersOf } from "@ezapi/router-core";
import { JsonParserMiddlerware } from "@ezapi/json-middleware";
import { ZodMiddleware } from "@ezapi/zod-middleware";
import { CreateMemberSchema } from "./../schema";
import { LoggingMiddleware } from "./middleware/logging-middleware";
import { IdTokenMiddleware, JwtMiddleware } from "./middleware/auth-middleware";

export type RouteHandlers = HandlersOf<ReturnType<typeof routes>>;

export const routes = (idTokenEndpoint: string, testCognitoClientId: string) => {
  return RouteBuilder.withMiddleware(LoggingMiddleware())
    .withMiddleware(JsonParserMiddlerware)
    .route("healthcheck", "GET", "/healthcheck")
    .withMiddleware(JwtMiddleware(testCognitoClientId))
    .withMiddleware(IdTokenMiddleware(idTokenEndpoint))
    .route("createMember", "POST", "/members", ZodMiddleware(CreateMemberSchema))
    .route("getMemberById", "GET", "/members/{id}")   
    
};
