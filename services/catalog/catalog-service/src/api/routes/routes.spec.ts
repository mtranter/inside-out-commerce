import { Ok } from "@ezapi/router-core";
import { RouteHandlers, routes } from "./routes";

describe("routes", () => {
  const mockHandlers: RouteHandlers = {
    healthcheck: () => Ok({ status: "OK" }),
    createProduct: () => Ok("Ok"),
    listProducts: () => Ok("Ok"),
    getProduct: () => Ok("Ok"),
    listProductsByCategory: () => Ok("Ok"),
    listProductsBySubCategory: () => Ok("Ok"),
  };
  it("should return a route", async () => {
    const sut = routes().build(mockHandlers);

    const result = await sut.run({
      method: "GET",
      url: "/healthcheck",
      headers: {
        "Content-Type": "application/json",
      },
      query: {},
    });
    expect(result?.statusCode).toEqual(200);
  });
});
