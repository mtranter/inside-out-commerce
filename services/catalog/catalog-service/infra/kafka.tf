module "events_topic" {
  source             = "../../../../infra/modules/kafka/confluent/topic"
  topic_name         = local.topic_name
  partitions         = 1
  replication_factor = 1
  key_schema         = file("${path.module}/../avro/product-data-key.avsc")
  value_schema       = file("${path.module}/../avro/product-data-value.avsc")
}

data "aws_ssm_parameter" "kafka_environment_id" {
  name = "/${var.project_name}/kafka/${var.environment}/environment/id"
}

module "kafka_user" {
  source         = "../../../../infra/modules/kafka/confluent/user"
  environment_id = data.aws_ssm_parameter.kafka_environment_id.value
  cluster_id     = data.aws_ssm_parameter.kafka_cluster_id.value
  username       = var.service_name
}

module "producer" {
  source                     = "../../../../infra/modules/kafka/confluent/producer"
  user_id                    = module.kafka_user.service_account.id
  cluster_id                 = data.aws_ssm_parameter.kafka_cluster_id.value
  environment_id             = data.aws_ssm_parameter.kafka_environment_id.value
  topic_prefix               = local.topic_prefix
  schema_registry_cluster_id = data.aws_ssm_parameter.schema_registry_cluster_id.value
}

module "tx_outbox" {
  source                  = "github.com/mtranter/terraform-aws-dynamodb-kafka-outbox?ref=v0.3.0-beta.0"
  instance_name           = "${var.project_name}-${var.environment}-${var.service_name}-tx-outbox"
  source_table_stream_arn = module.dynamodb.table.stream_arn
  kafka_brokers           = [split("://", data.aws_ssm_parameter.kafka_cluster_endpoint.value)[1]]
  kafka_user_id           = module.kafka_user.api_key_id
  kafka_user_secret       = module.kafka_user.api_key_secret
}
