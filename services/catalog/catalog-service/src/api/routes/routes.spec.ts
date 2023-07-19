import { Ok } from "@ezapi/router-core";
import { RouteHandlers, routes } from "./routes";

describe("routes", () => {
  const mockHandlers: RouteHandlers = {
    healthcheck: () => Ok({ status: "OK" }),
    createProduct: () => Ok("Ok"),
    batchCreateProduct: () => Ok("Ok"),
    listProducts: () => Ok("Ok"),
    updateProduct: () => Ok("Ok"),
    deleteProduct: () => Ok("Ok"),
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
  it("pageSize should be an int", async () => {
    const sut = routes().build({
      ...mockHandlers,

      listProducts: async (req) => {
        return Ok(JSON.stringify(req.queryParams.pageSize));
      },
    });

    const result = await sut.run({
      method: "GET",
      url: "/",
      headers: {
        "Content-Type": "application/json",
      },
      query: {
        pageSize: "1"
      },
    });
    expect(result?.statusCode).toEqual(200);
    expect(JSON.parse(result?.body!.toString()!)).toEqual("1");
  });
});
