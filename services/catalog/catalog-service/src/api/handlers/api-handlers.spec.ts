import { MockRepo, mockRepo } from "../../../test/repo/repo";
import { handlers } from "./api-handlers";
import { RouteHandlers } from "../routes/routes";
import { buildTestProductRequest } from "./../../../test/models/utils";
import { mockSchemaRegistry } from "../../../test/schema-registry";
import { CatalogService } from "../../domain/catalog-service";
import { TxOutboxMessageFactory } from "dynamodb-kafka-outbox";
describe("handlers", () => {
  let repo: MockRepo;
  let sut: RouteHandlers;
  let sendMessageBatch = jest.fn(() => Promise.resolve({} as any));
  beforeEach(() => {
    repo = mockRepo();
    const catalogService = CatalogService(
      {
        topic: "productsTopic",
        keySchemaId: 1,
        valueSchemaId: 2,
        batchCreateProductQueueUrl:
          "http://localhost:4566/000000000000/batch-create-products-queue",
      },
      TxOutboxMessageFactory({ registry: mockSchemaRegistry }),
      repo
    );
    sut = handlers(repo, { sendMessageBatch }, catalogService);
  });

  describe("create product", () => {
    const postedProduct = buildTestProductRequest();
    it("should persist product and product created event", async () => {
      const request = {
        safeBody: postedProduct,
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
  describe("update product", () => {
    const postedProduct = buildTestProductRequest();
    it("should persist product and product created event", async () => {
      repo._putProduct(postedProduct);
      const newName = "Test Update Product";
      const request = {
        safeBody: {
          name: newName,
        },
        jsonBody: {},
        pathParams: {
          sku: postedProduct.sku,
        },
        url: "/products" as const,
        method: "POST" as const,
        queryParams: {},
        headers: {},
      };
      const response = await sut.updateProduct(request);
      expect(response.statusCode).toEqual(200);

      const saved = repo.productsState[postedProduct.sku];
      expect(saved.name).toEqual(newName);

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
        eventType: "com.insideout.product.updated",
        payload: { ...postedProduct, ...request.safeBody },
      });
    });
    it("should return 404 for non existent product", async () => {
      const newName = "Test Update Product";
      const request = {
        safeBody: {
          name: newName,
        },
        jsonBody: {},
        pathParams: {
          sku: postedProduct.sku,
        },
        url: "/products" as const,
        method: "POST" as const,
        queryParams: {},
        headers: {},
      };
      const response = await sut.updateProduct(request);
      expect(response.statusCode).toEqual(404);

      const saved = repo.productsState[postedProduct.sku];
      expect(saved).toBeUndefined()

      const events = repo.eventsState;
      expect(events.length).toEqual(0);
    });
  });
  describe("read endpoints", () => {
    const postedProduct = buildTestProductRequest();
    const request = {
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
    describe("get product by subCategory", () => {
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
