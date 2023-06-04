locals {
  execute_scope = "api.execute"
  stage_name    = "live"
}

resource "aws_api_gateway_rest_api" "this" {
  name = "inside-out-bank-members"
}

data "archive_file" "api" {
  output_path = "${path.module}/api.zip"
  source_file = "${path.module}/../dist/api-handler.js"
  type        = "zip"
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

data "aws_region" "current" {}


module "api_function" {
  source           = "github.com/mtranter/platform-in-a-box-aws//modules/terraform-aws-piab-lambda"
  name             = "InsideOutBankMembersApi-${var.environment}"
  service_name     = "InsideOutBankMembers"
  runtime          = "nodejs18.x"
  handler          = "api-handler.handler"
  filename         = data.archive_file.api.output_path
  source_code_hash = data.archive_file.api.output_base64sha256
  timeout          = 10
  layers           = []
  create_dlq       = false
  tags             = {}
  environment_vars = {
    API_STAGE                = local.stage_name
    TABLE_NAME               = module.dynamodb.table.id
    MEMBERS_TOPIC            = local.topic_name
    KEY_SCHEMA_ID            = module.member_data_topic.key_schema_id
    VALUE_SCHEMA_ID          = module.member_data_topic.value_schema_id
    SCHEMA_REGISTRY_HOST     = data.aws_ssm_parameter.schema_registry_endpoint.value
    SCHEMA_REGISTRY_USERNAME = data.aws_ssm_parameter.schema_registry_username.value
    SCHEMA_REGISTRY_PASSWORD = data.aws_ssm_parameter.schema_registry_password.value
    ID_TOKEN_ENDPOINT        = "https://${var.project_name}-${var.environment}.auth.${data.aws_region.current.name}.amazoncognito.com/oauth2/token"
    TEST_CLIENT_ID           = aws_cognito_user_pool_client.this.id

  }
}

// role policy to allow lambda to speak to dynamodb
resource "aws_iam_role_policy" "allow_dynamodb" {
  role   = module.api_function.execution_role.id
  policy = data.aws_iam_policy_document.allow_dynamodb.json
}

data "aws_cognito_user_pools" "this" {
  name = "${var.project_name}-${var.environment}"
}

resource "aws_cognito_resource_server" "api" {
  identifier = "https://members.inside-out-bank.com"
  name       = "InsideOutBankMembersApi"

  scope {
    scope_name        = local.execute_scope
    scope_description = "Use the API"
  }

  user_pool_id = data.aws_cognito_user_pools.this.ids[0]
}

resource "aws_cognito_user_pool_client" "this" {
  name                                 = "MembersTestClient"
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

// store client id and secret in SSM
resource "aws_ssm_parameter" "test_client_id" {
  name  = "/${var.project_name}/cognito/${var.environment}/members_service_test_client_id"
  type  = "SecureString"
  value = aws_cognito_user_pool_client.this.id
}

resource "aws_ssm_parameter" "test_client_secret" {
  name  = "/${var.project_name}/cognito/${var.environment}/members_service_test_client_secret"
  type  = "SecureString"
  value = aws_cognito_user_pool_client.this.client_secret
}

resource "aws_api_gateway_authorizer" "this" {
  name          = "InsideOutBankMembersApi"
  rest_api_id   = aws_api_gateway_rest_api.this.id
  type          = "COGNITO_USER_POOLS"
  provider_arns = [data.aws_cognito_user_pools.this.arns[0]]
}

module "api_integration" {
  source        = "../../../../infra/modules/aws/lambda-proxy-api"
  api_name      = aws_api_gateway_rest_api.this.name
  function_name = module.api_function.function.id
  authorizer = {
    type          = "COGNITO_USER_POOLS"
    authorizer_id = aws_api_gateway_authorizer.this.id
    oauth_scopes  = ["${aws_cognito_resource_server.api.identifier}/${local.execute_scope}"]
  }


  depends_on = [aws_api_gateway_rest_api.this]
}

resource "aws_api_gateway_deployment" "this" {
  rest_api_id = aws_api_gateway_rest_api.this.id

  triggers = {
    redeployment = sha1(jsonencode(concat([module.api_integration.deployment_triggers], [data.archive_file.api.output_base64sha256])))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "this" {
  deployment_id = aws_api_gateway_deployment.this.id
  rest_api_id   = aws_api_gateway_rest_api.this.id
  stage_name    = local.stage_name
}
