import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  HttpMethod,
  Router,
  Response as CoreResponse,
  Body,
  RouteBuilder,
  Ok,
  ApiBuilder,
} from "@ezapi/router-core";
import { JsonParserMiddlerware } from "@ezapi/json-middleware";
import { NextJsMiddleware } from "@ezapi/nextjs-backend";

const api = RouteBuilder.withMiddleware(JsonParserMiddlerware)
  .route("hello", "GET", "/hello/{name}")
  .build({
    hello: (req) => {
      return Ok(req.pathParams.name);
    },
  });
// This function can be marked `async` if using `await` inside
export const middleware = NextJsMiddleware(ApiBuilder.build({ "/api": api }), {
  return404OnNotFound: true,
});

// export const middleware = (request: NextRequest) => {
//     return NextResponse.redirect(new URL('/home', request.url))
//   }

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/api/:path*",
};
