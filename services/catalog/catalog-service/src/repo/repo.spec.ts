import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { ProductRepo, buildTable } from "./repo";
import { buildTestProduct } from "../../test/models/utils";

const dynamoDB = new DynamoDB({
  region: "local-env",
  endpoint: "http://localhost:9011",
  credentials: {
    accessKeyId: "accessKeyId",
    secretAccessKey: "secretAccessKey",
  },
});

describe("DynamoDB Repo Spec", () => {
  const table = buildTable("products", dynamoDB);
  beforeEach(async () => {
    await table.deleteTable().catch(() => {
      // ignore
    });
    await table.createTable({
      billingMode: "PAY_PER_REQUEST",
      keyDefinitions: {
        hk: "S",
        sk: "S",
        category: "S",
        subCategory: "S",
      },
    });
  });
  const sut = ProductRepo({ tableName: "products", client: dynamoDB });
  it("should create and read products", async () => {
    const putProduct = buildTestProduct();
    await sut.put(putProduct, {
      topic: "",
      key: "k",
      value: "v",
      isTxOutboxEvent: true,
    });
    const result = await sut.get(putProduct.sku);
    expect(result).toEqual(putProduct);
    const results = await table.scan();
    expect(results.records.length).toEqual(2);
    const readProduct = await sut.get(putProduct.sku);
    expect(readProduct).toEqual(putProduct);

    const productsByCategory = await sut.listProductByCategory(
      putProduct.categoryId
    );
    expect(productsByCategory.products.length).toEqual(1);
    expect(productsByCategory.products[0]).toEqual(putProduct);

    const productsBySubcategory = await sut.listProductBySubCategory(
      putProduct.subCategory
    );
    expect(productsBySubcategory.products.length).toEqual(1);
    expect(productsBySubcategory.products[0]).toEqual(putProduct);
  });
  it("should page through products by category", async () => {
    const randomString = () => Math.random().toString(36).substring(7);
    for (let i = 0; i < 150; i++) {
      const putProduct = buildTestProduct();
      putProduct.sku = randomString();
      putProduct.categoryId = "cat1";
      putProduct.subCategory = "subcat1";
      await sut.put(putProduct, {
        topic: "",
        key: `k`,
        value: "v",
        isTxOutboxEvent: true,
      });
    }
    const productsByCategory = await sut.listProductByCategory("cat1");
    expect(productsByCategory.products.length).toEqual(100);
    expect(productsByCategory.nextToken).toBeDefined();
    const productsByCategory2 = await sut.listProductByCategory(
      "cat1",
      productsByCategory.nextToken
    );
    expect(productsByCategory2.products.length).toEqual(50);
  });
  it("should page through products by subCategory", async () => {
    const randomString = () => Math.random().toString(36).substring(7);
    for (let i = 0; i < 150; i++) {
      const putProduct = buildTestProduct();
      putProduct.sku = randomString();
      putProduct.categoryId = "cat1";
      putProduct.subCategory = "subcat1";
      await sut.put(putProduct, {
        topic: "",
        key: `k`,
        value: "v",
        isTxOutboxEvent: true,
      });
    }
    const productsByCategory = await sut.listProductBySubCategory("subcat1");
    expect(productsByCategory.products.length).toEqual(100);
    expect(productsByCategory.nextToken).toBeDefined();
    const productsByCategory2 = await sut.listProductBySubCategory(
      "subcat1",
      productsByCategory.nextToken
    );
    expect(productsByCategory2.products.length).toEqual(50);
  });
});
