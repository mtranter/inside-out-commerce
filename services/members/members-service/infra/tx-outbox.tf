
module "tx_outbox" {
  source                  = "../../../shared/dynamodb-tx-outbox/infra"
  project_name            = var.project_name
  environment             = var.environment
  service_name            = var.service_name
  source_table_stream_arn = module.dynamodb.table.stream_arn
  kafka_user_id           = module.kafka_user.api_key_id
  kafka_user_secret       = module.kafka_user.api_key_secret
}
