import { MockRepo, mockRepo } from "../../../test/api/handler/repo";
import { handlers } from "./api-handlers";
import { RouteHandlers } from "../routes/routes";
import { buildTestProductRequest } from "./../../../test/models/utils";
import { mockSchemaRegistry } from "../../../test/schema-registry";
describe("handlers", () => {
  let repo: MockRepo;
  let sut: RouteHandlers;
  beforeEach(() => {
    repo = mockRepo();
    sut = handlers(
      {
        topic: "productsTopic",
        keySchemaId: 1,
        valueSchemaId: 2,
      },
      mockSchemaRegistry,
      repo
    );
  });

  describe("put product", () => {
    const postedProduct = buildTestProductRequest();
    it("should persist product and product created event", async () => {
      const request = {
        safeBody: postedProduct,
        jwt: { sub: "123", client_id: "123", isTestClient: true },
        userInfo: { sub: "123", email: "johnsmith@gmail.com" },
        jsonBody: {},
        pathParams: {},
        url: "/products" as const,
        method: "POST" as const,
        queryParams: {},
        headers: {},
      };
      const response = await sut.createProduct(request);
      expect(response.statusCode).toEqual(201);
      expect(response.body).toEqual(postedProduct);

      const saved = repo.productsState[postedProduct.sku];
      expect(saved).toEqual(postedProduct);

      const events = repo.eventsState;
      expect(events.length).toEqual(1);
      const event = events[0];
      expect(event).toBeDefined();
      expect(event.topic).toEqual("productsTopic");
      const eventValue = JSON.parse(
        Buffer.from(event.value, "base64").toString("ascii")
      );
      expect(eventValue).toMatchObject({
        eventId: expect.any(String),
        eventType: "com.insideout.product.created",
        payload: postedProduct,
      });
    });
  });
  describe("read endpoints", () => {
    const postedProduct = buildTestProductRequest();
    const request = {
      jwt: { sub: "123", client_id: "123", isTestClient: true },
      userInfo: { sub: "123", email: "johnsmith@gmail.com" },
      jsonBody: {},
      pathParams: {
        sku: postedProduct.sku,
        category: postedProduct.categoryId,
        subCategory: postedProduct.subCategory,
      },
      url: "/products/123" as const,
      method: "GET" as const,
      queryParams: {},
      headers: {},
    };
    describe("get product", () => {
      it("should return 200 for existing product", async () => {
        await repo.put(postedProduct, {
          topic: "",
          key: "k",
          value: "v",
          isTxOutboxEvent: true,
        });
        const response = await sut.getProduct(request);
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual(postedProduct);
      });
      it("should return 404 for non-existing product", async () => {
        const response = await sut.getProduct(request);
        expect(response.statusCode).toEqual(404);
      });
    });
    describe("get product by category", () => {
      it("should return 200", async () => {
        await repo.put(postedProduct, {
          topic: "",
          key: "k",
          value: "v",
          isTxOutboxEvent: true,
        });
        const response = await sut.listProductsByCategory(request);
        expect(response.statusCode).toEqual(200);
        expect(response.body).toMatchObject({ products: [postedProduct] });
      });
    });
    describe("get product by subcategory", () => {
      it("should return 200", async () => {
        await repo.put(postedProduct, {
          topic: "",
          key: "k",
          value: "v",
          isTxOutboxEvent: true,
        });
        const response = await sut.listProductsBySubCategory(request);
        expect(response.statusCode).toEqual(200);
        expect(response.body).toMatchObject({ products: [postedProduct] });
      });
    });
  });
});
