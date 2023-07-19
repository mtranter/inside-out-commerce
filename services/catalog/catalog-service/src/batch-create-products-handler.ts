import { SQSHandler } from "aws-lambda";
import { CatalogService, CreateProductRequest } from "./domain";
import { catalogService } from "./setup";
import log from "./infra/logging";

export const _handler =
  (svc: CatalogService): SQSHandler =>
  async (event) => {
    log.info("SQS Handler", event);
    const failureIds: string[] = [];
    const products = event.Records.map((r) => ({
      product: JSON.parse(r.body) as CreateProductRequest,
      msgId: r.messageId,
    }));
    await Promise.all(
      products.map(({ product, msgId }) => {
        return svc.createProduct(product).catch((e) => {
          log.error("Error creating product", e);
          failureIds.push(msgId);
        });
      })
    );
    return {
      batchItemFailures: failureIds.map((id) => ({
        itemIdentifier: id,
      })),
    };
  };

export const handler: SQSHandler = _handler(catalogService);
