
provider "aws" {
  region = "ap-southeast-2"
  default_tags {
    tags = {
      "Project"     = var.project_name
      "Environment" = var.environment
    }
  }
}

data "aws_ssm_parameter" "conflient_api_key" {
  name = "/confluent/cloud-api/key"
}

data "aws_ssm_parameter" "conflient_api_secret" {
  name = "/confluent/cloud-api/secret"
}

data "aws_ssm_parameter" "kafka_cluster_id" {
  name = "/super-in-a-box/kafka/cluster/id"
}

data "aws_ssm_parameter" "kafka_rest_endpoint" {
  name = "/super-in-a-box/kafka/rest/endpoint"
}

data "aws_ssm_parameter" "schema_registry_cluster_id" {
  name = "/super-in-a-box/kafka/schema_registry/cluster/id"
}

data "aws_ssm_parameter" "schema_registry_rest_endpoint" {
  name = "/super-in-a-box/kafka/schema_registry/rest/endpoint"
}

data "aws_ssm_parameter" "kafka_admin_key_id" {
  name = "/super-in-a-box/kafka/admin/key/id"
}

data "aws_ssm_parameter" "kafka_admin_key_secret" {
  name = "/super-in-a-box/kafka/admin/key/secret"
}


data "aws_ssm_parameter" "schema_registry_api_key_id" {
  name = "/super-in-a-box/kafka/schema_registry/api/key/id"
}

data "aws_ssm_parameter" "schema_registry_api_key_secret" {
  name = "/super-in-a-box/kafka/schema_registry/api/key/secret"
}


provider "confluent" {
  cloud_api_key    = data.aws_ssm_parameter.conflient_api_key.value
  cloud_api_secret = data.aws_ssm_parameter.conflient_api_secret.value

  kafka_id            = data.aws_ssm_parameter.kafka_cluster_id.value
  kafka_rest_endpoint = data.aws_ssm_parameter.kafka_rest_endpoint.value
  kafka_api_key       = data.aws_ssm_parameter.kafka_admin_key_id.value
  kafka_api_secret    = data.aws_ssm_parameter.kafka_admin_key_secret.value

  schema_registry_id            = data.aws_ssm_parameter.schema_registry_cluster_id.value
  schema_registry_rest_endpoint = data.aws_ssm_parameter.schema_registry_rest_endpoint.value
  schema_registry_api_key       = data.aws_ssm_parameter.schema_registry_api_key_id.value
  schema_registry_api_secret    = data.aws_ssm_parameter.schema_registry_api_key_secret.value
}
