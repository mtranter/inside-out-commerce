data "aws_ssm_parameter" "conflient_api_key" {
  name = "/confluent/cloud-api/key"
}

data "aws_ssm_parameter" "conflient_api_secret" {
  name = "/confluent/cloud-api/secret"
}

data "aws_ssm_parameter" "kafka_cluster_id" {
  name = "/${var.project_name}/kafka/${var.environment}/cluster/id"
}

data "aws_ssm_parameter" "kafka_rest_endpoint" {
  name = "/${var.project_name}/kafka/${var.environment}/rest/endpoint"
}

data "aws_ssm_parameter" "schema_registry_cluster_id" {
  name = "/${var.project_name}/kafka/${var.environment}/schema_registry/cluster/id"
}

data "aws_ssm_parameter" "schema_registry_rest_endpoint" {
  name = "/${var.project_name}/kafka/${var.environment}/schema_registry/rest/endpoint"
}

data "aws_ssm_parameter" "kafka_admin_key_id" {
  name = "/${var.project_name}/kafka/${var.environment}/admin/key/id"
}

data "aws_ssm_parameter" "kafka_admin_key_secret" {
  name = "/${var.project_name}/kafka/${var.environment}/admin/key/secret"
}


data "aws_ssm_parameter" "schema_registry_api_key_id" {
  name = "/${var.project_name}/kafka/${var.environment}/schema_registry/api/key/id"
}

data "aws_ssm_parameter" "schema_registry_api_key_secret" {
  name = "/${var.project_name}/kafka/${var.environment}/schema_registry/api/key/secret"
}

data "aws_ssm_parameter" "schema_registry_endpoint" {
  name = "/${var.project_name}/kafka/${var.environment}/schema_registry/rest/endpoint"
}

data "aws_ssm_parameter" "schema_registry_username" {
  name = "/${var.project_name}/kafka/${var.environment}/schema_registry/api/key/id"
}

data "aws_ssm_parameter" "schema_registry_password" {
  name = "/${var.project_name}/kafka/${var.environment}/schema_registry/api/key/secret"
}

data "aws_ssm_parameter" "auth_endpoint" {
  name = "/${var.project_name}/${var.environment}/cognito/auth_endpoint"
}

data "aws_ssm_parameter" "kafka_cluster_endpoint" {
  name = "/${var.project_name}/kafka/${var.environment}/cluster/endpoint"
}


data "aws_region" "current" {}

data "aws_cognito_user_pools" "this" {
  name = "${var.project_name}-${var.environment}"
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
