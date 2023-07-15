import { restApiHandler } from "@ezapi/aws-rest-api-backend";
import { routes } from "./routes";
import { handlers } from "./handlers";
import { config } from "../config";
import { ApiBuilder } from "@ezapi/router-core";
import { SQS } from "@aws-sdk/client-sqs";
import { catalogService, productRepo } from "../setup";

const _handers = handlers(
  productRepo,
  new SQS({ region: process.env.AWS_REGION || "local" }),
  catalogService
);

const api = ApiBuilder.build({ "/catalog": routes().build(_handers) });

export const handler = restApiHandler(api, config.stage);
