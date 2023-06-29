locals {
  consumer_group_id = "${var.service_name}-test"
}

resource "aws_cognito_user_pool_client" "this" {
  name                                 = "TestClient"
  user_pool_id                         = data.aws_cognito_user_pools.this.ids[0]
  generate_secret                      = true
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["client_credentials"]
  allowed_oauth_scopes                 = ["${aws_cognito_resource_server.api.identifier}/${local.execute_scope}"]
  supported_identity_providers         = ["COGNITO"]
  explicit_auth_flows                  = ["ALLOW_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]
  access_token_validity                = 5
  id_token_validity                    = 5
  refresh_token_validity               = 5
  token_validity_units {
    access_token  = "minutes"
    id_token      = "minutes"
    refresh_token = "days"
  }

  depends_on = [
    aws_cognito_resource_server.api
  ]
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
    clientId     = aws_cognito_user_pool_client.this.id
    clientSecret = aws_cognito_user_pool_client.this.client_secret
    scope        = "${aws_cognito_resource_server.api.identifier}/${local.execute_scope}"
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
