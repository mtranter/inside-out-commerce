import { Middleware, Unauthorized } from "@ezapi/router-core";

type IdTokenClaims = {
  sub: string;
  "cognito:groups"?: string[];
  email_verified?: boolean;
  "cognito:preferred_role"?: string;
  iss: string;
  "cognito:username"?: string;
  middle_name?: string;
  nonce?: string;
  origin_jti?: string;
  "cognito:roles"?: string[];
  email: string;
};
export const IdTokenMiddleware = <A extends { jwt: JwtClaims }>(
  userInfoEndpoint: string
) => {
  return Middleware.from<A, { userInfo: IdTokenClaims }>(
    (handler) => async (req) => {
      const response = await fetch(userInfoEndpoint, {
        headers: {
          Authorization: req.headers.authorization as string,
        },
      });
      const userInfo: IdTokenClaims =
        await (response.json() as Promise<IdTokenClaims>);
      return handler({ ...req, ...{ userInfo: userInfo } });
    }
  );
};

type JwtClaims = {
  sub: string;
} & {};
export const JwtMiddleware = <A extends {}>() =>
  Middleware.from<A, { jwt: JwtClaims }>((handler) => async (req) => {
    const authHeader = req.headers["Authorization"] as string;
    if (!authHeader) {
      return Unauthorized(
        JSON.stringify({ message: "Missing Authorization header" })
      );
    }
    const [_, token] = authHeader.split(" ");
    if (!token) {
      return Unauthorized(JSON.stringify({ message: "Missing token" }));
    }
    try {
      const [header, payload, signature] = token.split(".");
      const decodedPayload = Buffer.from(payload, "base64").toString("utf-8");
      const payloadObj = JSON.parse(decodedPayload) as JwtClaims;
      return handler({ ...req, ...{ jwt: payloadObj } });
    } catch (e) {
      return Unauthorized(JSON.stringify({ message: "Invalid token" }));
    }
  });
