import { Middleware } from "@ezapi/router-core";
import log from "./../logging";

export const LoggingMiddleware = <A extends {}>() =>
  Middleware.from<A, A>((handler) => async (req) => {
    log.info("Request received", { req });
    const response = await handler(req);
    log.info("Request completed", { req, response });
    return response;
  });
