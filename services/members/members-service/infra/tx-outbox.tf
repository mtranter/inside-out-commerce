
data "aws_ssm_parameter" "kafka_cluster_endpoint" {
  name = "/${var.project_name}/kafka/${var.environment}/cluster/endpoint"
}

module "tx_outbox" {
  source                  = "github.com/mtranter/terraform-aws-dynamodb-kafka-outbox?ref=v0.1.4-beta.0"
  instance_name           = "${var.project_name}-${var.environment}-${var.service_name}-tx-outbox"
  source_table_stream_arn = module.dynamodb.table.stream_arn
  kafka_brokers           = [split("://", data.aws_ssm_parameter.kafka_cluster_endpoint.value)[1]]
  kafka_user_id           = module.kafka_user.api_key_id
  kafka_user_secret       = module.kafka_user.api_key_secret
}
