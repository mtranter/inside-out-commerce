/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useAuth0 } from "@auth0/auth0-react";
import {
  CognitoIdentityClient,
  GetIdCommand,
  GetOpenIdTokenCommand,
} from "@aws-sdk/client-cognito-identity";
import {
  AssumeRoleWithWebIdentityCommand,
  Credentials,
  STSClient,
} from "@aws-sdk/client-sts";
import { AwsClient, FetchOptions } from "aws4fetch";

const getAwsWebCredentials = async (idToken: string) => {
  const cognitoClient = new CognitoIdentityClient({
    region: import.meta.env.VITE_AWS_REGION,
  });
  const getIdCmd = new GetIdCommand({
    IdentityPoolId: import.meta.env.VITE_IDENTITY_POOL_ID,
    Logins: {
      [import.meta.env.VITE_USER_POOL_LOGIN_ID]: idToken,
    },
  });
  const getIdResponse = await cognitoClient.send(getIdCmd);
  const getCredentialsCmd = new GetOpenIdTokenCommand({
    IdentityId: getIdResponse.IdentityId,
    Logins: {
      [import.meta.env.VITE_USER_POOL_LOGIN_ID]: idToken,
    },
  });
  const getCredentialsResponse = await cognitoClient.send(getCredentialsCmd);
  const stsClient = new STSClient({
    region: import.meta.env.VITE_AWS_REGION,
  });
  const cmd = new AssumeRoleWithWebIdentityCommand({
    RoleSessionName: "WebSession",
    WebIdentityToken: getCredentialsResponse.Token!,
    RoleArn: import.meta.env.VITE_ADMIN_IAM_ROLE,
    DurationSeconds: 3600,
  });
  return stsClient.send(cmd).then((r) => r.Credentials!);
};

type FetchFn = (url: RequestInfo, options?: FetchOptions) => Promise<Response>;
let credentials: Credentials = {
  AccessKeyId: "",
  SecretAccessKey: "",
  SessionToken: "",
  Expiration: new Date("1970-01-01"),
};
export const useIamFetch = (): { fetch: FetchFn } => {
  const { getIdTokenClaims } = useAuth0();
  return {
    fetch: async (url: RequestInfo, options?: FetchOptions) => {
      if (credentials.Expiration! < new Date()) {
        credentials = await getAwsWebCredentials(
          (await getIdTokenClaims())!.__raw!
        );
      }
      const aws = new AwsClient({
        accessKeyId: credentials.AccessKeyId!,
        secretAccessKey: credentials.SecretAccessKey!,
        sessionToken: credentials.SessionToken!,
      });
      return aws.fetch(url, options);
    },
  };
};
