import { HttpMiddleware } from "@ezapi/router-core";

export const LoggingMiddleware = <A extends {}, B>({
  log,
}: {
  log: { info: (msg: string, ctx: any) => void };
}) =>
  HttpMiddleware.of<A, A, B>(async (req, handler) => {
    log.info("Request received", { req });
    const response = await handler(req);
    log.info("Request completed", { req, response });
    return response;
  });


  