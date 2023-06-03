import { BackendUtils, Ok } from "@ezapi/router-core";
import { routes } from "./routes";
import { generateMock } from "@anatine/zod-mock";
import { CreateMemberSchema } from "../schema";

describe("routes", () => {
  it("should return a route", async () => {
    const _routes = routes(
      {
        newMemberHandler: (req) => {
          return Ok({ status: "OK" });
        },
        getMember: jest.fn(),
      },
      "test"
    );
    const handler = BackendUtils.buildHandler(_routes);
    const result = await handler({
        method: "POST",
        url: "/members",
        body: JSON.stringify(generateMock(CreateMemberSchema)),
        headers: {
            "Content-Type": "application/json",
            'Authorization': "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huIHNtaXRoIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.Uuiwcuj0PLPxnZdy3PWhaKvx9wPoF2w1iX7GSpo3s4E"
        },
        query: {}
    })
    expect(result?.statusCode).toEqual(200);
  });
});
