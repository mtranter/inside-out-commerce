import { SSM } from "@aws-sdk/client-ssm";

jest.setTimeout(10000);
const ssm = new SSM({});
const getSSMValue = async (name: string) =>
  await ssm
    .getParameter({
      Name: name,
      WithDecryption: true,
    })
    .then((r) => r.Parameter?.Value);
describe("healthcheck endpoint", () => {
  it("should return 200", async () => {
    const jwtEndpoint =
      "https://inside-out-bank-prod.auth.ap-southeast-2.amazoncognito.com/oauth2/token";
    const clientIdP = getSSMValue(
      `/inside-out-bank/cognito/prod/members_service_test_client_id`
    );
    const clientSecretP = getSSMValue(
      `/inside-out-bank/cognito/prod/members_service_test_client_secret`
    );
    const clientId = await clientIdP;
    const clientSecret = await clientSecretP;
    const token = (await fetch(jwtEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        authorization:
          "Basic " +
          Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
      },
      body: `grant_type=client_credentials&client_id=${clientId}&scope=https://members.inside-out-bank.com/api.execute`,
    })
      .then((r) => r.json())
      .catch((e) => {
        console.error(e);
        throw e;
      })) as { access_token: string };
    const idToken = token.access_token;
    const response = await fetch(
      "https://84t0e5o34j.execute-api.ap-southeast-2.amazonaws.com/live/healthcheck",
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );
    expect(response.status).toEqual(200);
  });
});
