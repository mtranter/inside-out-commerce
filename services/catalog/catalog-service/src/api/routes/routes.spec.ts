import { Ok } from "@ezapi/router-core";
import { RouteHandlers, routes } from "./routes";

describe("routes", () => {
  const mockHandlers: RouteHandlers = {
    healthcheck: () => Ok({ status: "OK" }),
    createProduct: () => Ok("Ok"),
    getProduct: () => Ok("Ok"),
    listProductsByCategory: () => Ok("Ok"),
    listProductsBySubCategory: () => Ok("Ok"),
  }
  it("should return a route", async () => {
    const sut = routes(
      "test",
      "123"
    ).build(mockHandlers);

    const result = await sut.run({
      method: "GET",
      url: "/products/1",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huIHNtaXRoIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.Uuiwcuj0PLPxnZdy3PWhaKvx9wPoF2w1iX7GSpo3s4E",
      },
      query: {},
    });
    expect(result?.statusCode).toEqual(200);
  });
});
