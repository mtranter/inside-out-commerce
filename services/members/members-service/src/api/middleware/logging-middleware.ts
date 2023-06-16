import { HttpMiddleware, Middleware } from "@ezapi/router-core";
import log from "./../../logging";

export const LoggingMiddleware = <A extends {}, B>() =>
  HttpMiddleware.of<A, A, B>(async (req, handler) => {
    log.info("Request received", { req });
    const response = await handler(req);
    log.info("Request completed", { req, response });
    return response;
  });
