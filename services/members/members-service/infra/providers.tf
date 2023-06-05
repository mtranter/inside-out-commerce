
provider "aws" {
  region = "ap-southeast-2"
  default_tags {
    tags = {
      "Project"     = var.project_name
      "Environment" = var.environment
    }
  }
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
