locals {
  consumer_group_id = "${var.service_name}-test"
}

// test iam user for API GW
resource "aws_iam_user" "test_api_user" {
  name = "${var.service_name}-test-user-${var.environment}"
}


data "aws_iam_policy_document" "allow_api" {
  statement {
    actions = [
      "execute-api:Invoke"
    ]

    resources = [
      aws_api_gateway_rest_api.this.execution_arn,
      "${aws_api_gateway_rest_api.this.execution_arn}/*"
    ]
  }
}

resource "aws_iam_access_key" "test_credentials" {
  user    = aws_iam_user.test_api_user.name
}

resource "aws_iam_user_policy" "allow_api" {
  name = "${var.service_name}-test-user-${var.environment}-allow-api"
  user = aws_iam_user.test_api_user.name

  policy = data.aws_iam_policy_document.allow_api.json
}

module "kafka_test_user" {
  source         = "../../../../infra/modules/kafka/confluent/user"
  environment_id = data.aws_ssm_parameter.kafka_environment_id.value
  cluster_id     = data.aws_ssm_parameter.kafka_cluster_id.value
  username       = "${var.service_name}-test-user"
}

module "test_consumer" {
  source                     = "../../../../infra/modules/kafka/confluent/consumer"
  user_id                    = module.kafka_test_user.service_account.id
  cluster_id                 = data.aws_ssm_parameter.kafka_cluster_id.value
  environment_id             = data.aws_ssm_parameter.kafka_environment_id.value
  topics                     = [local.topic_name]
  consumer_group_id          = local.consumer_group_id
  schema_registry_cluster_id = data.aws_ssm_parameter.schema_registry_cluster_id.value
}

resource "aws_ssm_parameter" "api_test_config" {
  name = "/${var.project_name}/${var.environment}/${var.service_name}/test-user/api-config"
  type = "SecureString"
  value = jsonencode({
    authEndpoint = data.aws_ssm_parameter.auth_endpoint.value
    clientId     = aws_iam_access_key.test_credentials.id
    clientSecret = aws_iam_access_key.test_credentials.secret
    apiBaseUrl   = aws_api_gateway_stage.this.invoke_url
  })
}

// store Kafka brokers and credentials in a JSON encoded SSM Secret
resource "aws_ssm_parameter" "kafka_test_config" {
  name = "/${var.project_name}/${var.environment}/${var.service_name}/test-user/kafka-config"
  type = "SecureString"
  value = jsonencode({
    brokers  = split("://", data.confluent_kafka_cluster.kafka_cluster.bootstrap_endpoint)[1]
    username = module.kafka_test_user.api_key_id
    password = module.kafka_test_user.api_key_secret
    groupId  = local.consumer_group_id
    topic    = local.topic_name
  })
}

// store JSON encoded Schema Registry credentials in SSM
resource "aws_ssm_parameter" "schema_registry_test_config" {
  name = "/${var.project_name}/${var.environment}/${var.service_name}/test-user/schema-registry-config"
  type = "SecureString"
  value = jsonencode({
    host     = data.confluent_schema_registry_cluster.schema_registry.rest_endpoint
    username = module.test_consumer.schema_registry_api_key_id
    password = module.test_consumer.schema_registry_api_key_secret
  })
}
