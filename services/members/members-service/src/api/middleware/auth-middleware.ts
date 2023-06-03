import { Middleware, Unauthorized } from "@ezapi/router-core";

export type IdTokenClaims = {
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
export const IdTokenMiddleware = <A extends { jwt: JwtClaims }, B>(
  userInfoEndpoint: string
) => {
  return Middleware.of<A, { userInfo: IdTokenClaims }, B>(
    async (req, handler) => {
      if (userInfoEndpoint === "test") {
        return handler({ ...req, ...{ userInfo: {email: 'test@test.com'} } } as any);
      } else {
        const response = await fetch(userInfoEndpoint, {
          headers: {
            Authorization: req.headers.authorization as string,
          },
        });
        const userInfo: IdTokenClaims =
          await (response.json() as Promise<IdTokenClaims>);
        return handler({ ...req, ...{ userInfo: userInfo } });
      }
    }
  );
};

export type JwtClaims = {
  sub: string;
  client_id: string;
};

export const JwtMiddleware = <A extends {}>() =>
  Middleware.of<A, { jwt: JwtClaims }, unknown>(async (req, handler) => {
    const authHeader = req.headers["Authorization"] as string;
    if (!authHeader) {
      return Unauthorized({ message: "Missing Authorization header" });
    }
    const [_, token] = authHeader.split(" ");
    if (!token) {
      return Unauthorized({ message: "Missing token" });
    }
    try {
      const [header, payload, signature] = token.split(".");
      const decodedPayload = Buffer.from(payload, "base64").toString("utf-8");
      const payloadObj = JSON.parse(decodedPayload) as JwtClaims;
      return handler({ ...req, ...{ jwt: payloadObj } });
    } catch (e) {
      return Unauthorized({ message: "Invalid token" });
    }
  });
