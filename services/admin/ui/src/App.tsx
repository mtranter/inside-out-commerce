import { useAuth0 } from "@auth0/auth0-react";
import { STSClient, AssumeRoleWithWebIdentityCommand, Credentials } from "@aws-sdk/client-sts";
import { useEffect, useState } from "react";

function App() {
  const { loginWithRedirect, isAuthenticated, getIdTokenClaims } = useAuth0();
  const [credentials, setCredentials] = useState<Credentials | undefined>()
  const doHealthcheck = async () => {
    const token = await getIdTokenClaims()
    const stsClient = new STSClient({ region: "ap-southeast-2" });
    const cmd = new AssumeRoleWithWebIdentityCommand({
      WebIdentityToken: token?.__raw,
      RoleArn: "arn:aws:iam::340502884936:role/inside-out-commerce-prod-catalog-service-web-identity",
      RoleSessionName: "web-identity",
    })
    const response  = await stsClient.send(cmd);
    setCredentials(response.Credentials)
  }


  return (
    <>
      <h1>{isAuthenticated ? "hey" : "No"} Hey</h1>
      <h1 onClick={() => loginWithRedirect()}>IO Commerce</h1>
      {isAuthenticated ? <button onClick={doHealthcheck}>Healthcheck</button> : null}
      {credentials ? <pre>{JSON.stringify(credentials, null, 2)}</pre> : null}
    </>
  )
}

export default App
