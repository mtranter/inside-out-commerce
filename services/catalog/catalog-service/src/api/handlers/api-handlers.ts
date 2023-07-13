import { Ok, Created, NotFound, Accepted } from "@ezapi/router-core";
import { v4 as uuidv4 } from "uuid";
import { RouteHandlers } from "../routes";
import { ProductRepo } from ".";
import { SQS } from "@aws-sdk/client-sqs";
import { CatalogService } from '../../domain/catalog-service';

export const handlers = (
  repo: ProductRepo,
  sqs: Pick<SQS, "sendMessageBatch">,
  service: CatalogService
): RouteHandlers => {

  return {
    healthcheck: async () => Ok({ status: "ok" }),
    listProducts: async (req) => {
      const { products, nextToken } = await repo.listProducts(
        req.queryParams.nextToken
      );
      return Ok({ products, nextToken });
    },
    createProduct: async (req) => {
      await service.createProduct(req.safeBody);
      return Created(req.safeBody, `/products/${req.safeBody.sku}`);
    },
    batchCreateProduct: async (req) => {
      await sqs.sendMessageBatch({
        QueueUrl: process.env.BATCH_CREATE_PRODUCT_QUEUE_URL,
        Entries: req.safeBody.map((product) => ({
          Id: uuidv4(),
          MessageBody: JSON.stringify(product),
        })),
      });
      return Accepted("Processing");
    },
    getProduct: async (req) => {
      const product = await repo.get(req.pathParams.sku);
      if (!product) {
        return NotFound(`Product with sku ${req.pathParams.sku} not found`);
      }
      return Ok(product);
    },
    listProductsByCategory: async (req) => {
      const products = await repo.listProductByCategory(
        req.pathParams.category,
        req.queryParams.nextToken
      );
      return Ok(products);
    },
    listProductsBySubCategory: async (req) => {
      const products = await repo.listProductBySubCategory(
        req.pathParams.subCategory,
        req.queryParams.nextToken
      );
      return Ok(products);
    },
  };
};
