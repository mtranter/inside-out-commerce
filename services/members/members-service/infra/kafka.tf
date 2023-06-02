locals {
  topic_prefix = "com.insideoutbank.members."
  topic_name   = "${local.topic_prefix}MemberData"
}

data "confluent_schema_registry_cluster" "schema_registry" {
  id = data.aws_ssm_parameter.schema_registry_cluster_id.value
  environment {
    id = data.aws_ssm_parameter.kafka_environment_id.value
  }
}

data "confluent_kafka_cluster" "kafka_cluster" {
  id = data.aws_ssm_parameter.kafka_cluster_id.value
  environment {
    id = data.aws_ssm_parameter.kafka_environment_id.value
  }
}

module "member_data_topic" {
  source             = "../../../../infra/modules/kafka/confluent/topic"
  topic_name         = local.topic_name
  partitions         = 1
  replication_factor = 1
  key_schema         = file("${path.module}/../avro/member-data-key.avsc")
  value_schema       = file("${path.module}/../avro/member-data-value.avsc")
}

data "aws_ssm_parameter" "kafka_environment_id" {
  name = "/${var.project_name}/kafka/${var.environment}/environment/id"
}

module "kafka_user" {
  source         = "../../../../infra/modules/kafka/confluent/user"
  environment_id = data.aws_ssm_parameter.kafka_environment_id.value
  cluster_id     = data.aws_ssm_parameter.kafka_cluster_id.value
  username       = "member-api"
}

module "producer" {
  source                     = "../../../../infra/modules/kafka/confluent/producer"
  user_id                    = module.kafka_user.service_account.id
  cluster_id                 = data.aws_ssm_parameter.kafka_cluster_id.value
  environment_id             = data.aws_ssm_parameter.kafka_environment_id.value
  topic_prefix               = local.topic_prefix
  schema_registry_cluster_id = data.aws_ssm_parameter.schema_registry_cluster_id.value
}


module "kafka_test_user" {
  source         = "../../../../infra/modules/kafka/confluent/user"
  environment_id = data.aws_ssm_parameter.kafka_environment_id.value
  cluster_id     = data.aws_ssm_parameter.kafka_cluster_id.value
  username       = "member-api-tester"
}

module "test_consumer" {
  source                     = "../../../../infra/modules/kafka/confluent/consumer"
  user_id                    = module.kafka_test_user.service_account.id
  cluster_id                 = data.aws_ssm_parameter.kafka_cluster_id.value
  environment_id             = data.aws_ssm_parameter.kafka_environment_id.value
  topics                     = [local.topic_name]
  consumer_group_id          = "members-service-tester"
  schema_registry_cluster_id = data.aws_ssm_parameter.schema_registry_cluster_id.value
}

// store Kafka brokers and credentials in a JSON encoded SSM Secret
resource "aws_ssm_parameter" "kafka_test_config" {
  name = "/${var.project_name}/members-service/test-user/kafka-config"
  type = "SecureString"
  value = jsonencode({
    brokers  = data.confluent_kafka_cluster.kafka_cluster.bootstrap_endpoint
    username = module.kafka_test_user.api_key_id
    password = module.kafka_test_user.api_key_secret
  })
}

// store JSON encoded Schema Registry credentials in SSM
resource "aws_ssm_parameter" "schema_registry_test_config" {
  name = "/${var.project_name}/members-service/test-user/schema-registry-config"
  type = "SecureString"
  value = jsonencode({
    host     = data.confluent_schema_registry_cluster.schema_registry.rest_endpoint
    username = module.test_consumer.schema_registry_api_key_id
    password = module.test_consumer.schema_registry_api_key_secret
  })
}
