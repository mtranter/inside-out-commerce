locals {
  execute_scope = "api.execute"
}

resource "aws_api_gateway_rest_api" "this" {
  name = "inside-out-bank-members"
}

data "archive_file" "api" {
  output_path = "${path.module}/api.zip"
  source_file = "${path.module}/../dist/api.js"
  type        = "zip"
}

module "api_function" {
  source           = "github.com/mtranter/platform-in-a-box-aws//modules/terraform-aws-piab-lambda"
  name             = "InsideOutBankMembersApi-${var.environment}"
  service_name     = "InsideOutBankMembers"
  runtime          = "nodejs18.x"
  handler          = "api.handler"
  filename         = data.archive_file.api.output_path
  source_code_hash = data.archive_file.api.output_base64sha256
  timeout          = 10
  layers           = []
  create_dlq       = false
  tags             = {}
  environment_vars = {}
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

    type           = "COGNITO_USER_POOLS"
    authorizaer_id = aws_api_gateway_authorizer.this
    oauth_scopes   = ["${aws_cognito_resource_server.api.identifier}/${local.execute_scope}"]
  }


  depends_on = [aws_api_gateway_rest_api.this]
}
