/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useAuth0 } from "@auth0/auth0-react";
import {
  STSClient,
  AssumeRoleWithWebIdentityCommand,
  Credentials,
} from "@aws-sdk/client-sts";
import {
  CognitoIdentityClient,
  GetIdCommand,
  GetOpenIdTokenCommand,
} from "@aws-sdk/client-cognito-identity";
import { useState } from "react";

function App() {
  const { loginWithRedirect, isAuthenticated, getIdTokenClaims } = useAuth0();
  const [credentials, setCredentials] = useState<Credentials | undefined>();
  const doHealthcheck = async () => {
    const token = await getIdTokenClaims();
    const cognitoClient = new CognitoIdentityClient({
      region: "ap-southeast-2",
    });
    const getIdCmd = new GetIdCommand({
      IdentityPoolId: "ap-southeast-2:082f6e4c-68ea-46c7-ad2c-384e7a8cecb7",
      Logins: {
        "cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_V1m1AEYXE":
          token?.__raw!,
      },
    });
    const getIdResponse = await cognitoClient.send(getIdCmd);
    const getCredentialsCmd = new GetOpenIdTokenCommand({
      IdentityId: getIdResponse.IdentityId,
      Logins: {
        "cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_V1m1AEYXE":
          token?.__raw!,
      },
    });
    const getCredentialsResponse = await cognitoClient.send(getCredentialsCmd);

    const stsClient = new STSClient({ region: "ap-southeast-2" });
    const cmd = new AssumeRoleWithWebIdentityCommand({
      RoleSessionName: "WebSession",
      WebIdentityToken: getCredentialsResponse.Token!,
      RoleArn:
        "arn:aws:iam::340502884936:role/inside-out-commerce-prod-catalog-service-web-identity",
    });
    const response = await stsClient.send(cmd);
    setCredentials(response.Credentials);
  };

  return (
    <>
      <h1>{isAuthenticated ? "hey" : "No"} Hey</h1>
      <h1 onClick={() => loginWithRedirect()}>IO Commerce</h1>
      {isAuthenticated ? (
        <button onClick={doHealthcheck}>Healthcheck</button>
      ) : null}
      {credentials ? <pre>{JSON.stringify(credentials, null, 2)}</pre> : null}
    </>
  );
}

export default App;
