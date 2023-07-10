/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useAuth0 } from "@auth0/auth0-react";
import {
  STSClient,
  AssumeRoleWithWebIdentityCommand,
} from "@aws-sdk/client-sts";
import {
  CognitoIdentityClient,
  GetIdCommand,
  GetOpenIdTokenCommand,
} from "@aws-sdk/client-cognito-identity";
import { AwsClient } from "aws4fetch";

console.log(import.meta.env.VITE_AWS_REGION)

function App() {
  const { loginWithRedirect, isAuthenticated, getIdTokenClaims } = useAuth0();
  const doHealthcheck = async () => {
    const token = await getIdTokenClaims();
    const cognitoClient = new CognitoIdentityClient({
      region: import.meta.env.VITE_AWS_REGION,
    });
    const getIdCmd = new GetIdCommand({
      IdentityPoolId: import.meta.env.VITE_IDENTITY_POOL_ID,
      Logins: {
        [import.meta.env.VITE_USER_POOL_LOGIN_ID]: token?.__raw!,
      },
    });
    const getIdResponse = await cognitoClient.send(getIdCmd);
    const getCredentialsCmd = new GetOpenIdTokenCommand({
      IdentityId: getIdResponse.IdentityId,
      Logins: {
        [import.meta.env.VITE_USER_POOL_LOGIN_ID]: token?.__raw!,
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
    });
    const response = await stsClient.send(cmd);
    const aws = new AwsClient({
      accessKeyId: response.Credentials?.AccessKeyId!,
      secretAccessKey: response.Credentials?.SecretAccessKey!,
      sessionToken: response.Credentials?.SessionToken!,
    });
    await aws
      .fetch(
        `${import.meta.env.VITE_CATALOG_API_ROOT}/catalog/healthcheck`
      )
      .then((res) => res.json())
      .then((res) => console.log(res));
  };

  return (
    <>
      <h1>{isAuthenticated ? "hey" : "No"} Hey</h1>
      <h1 onClick={() => loginWithRedirect()}>IO Commerce</h1>
      {isAuthenticated ? (
        <button onClick={doHealthcheck}>Healthcheck</button>
      ) : null}
    </>
  );
}

export default App;
