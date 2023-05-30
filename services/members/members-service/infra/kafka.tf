locals {
  topic_prefix = "com.insideoutbank.members."
  topic_name   = "${local.topic_prefix}member-created"
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
