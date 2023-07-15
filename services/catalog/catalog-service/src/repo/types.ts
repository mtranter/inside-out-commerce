import { TxOutboxMessage } from "dynamodb-kafka-outbox";
import { Product } from "../models";

export type EventDto = {
  hk: string;
  sk: string;
  category?: string;
  subCategory?: string;
} & TxOutboxMessage;

export type ProductDto = {
  hk: string;
  sk: string;
  category: string;
  subCategory: string;
  data: Product;
};

export type Dto = ProductDto | EventDto;