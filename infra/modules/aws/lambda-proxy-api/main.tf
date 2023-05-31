locals {
  parent_resource_id = coalesce(var.parent_resource_id, data.aws_api_gateway_rest_api.this.root_resource_id)
}

data "aws_api_gateway_rest_api" "this" {
  name = var.api_name
}

data "aws_lambda_function" "this" {
  function_name = var.function_name
  qualifier     = var.function_qualifier
}

# resource "aws_api_gateway_authorizer" "this" {
#   name          = var.api_name
#   rest_api_id   = data.aws_api_gateway_rest_api.this.id
#   type          = "COGNITO_USER_POOLS"
#   provider_arns = [aws_cognito_user_pool.this.arn]
# }

resource "aws_api_gateway_resource" "this" {
  parent_id   = local.parent_resource_id
  path_part   = "{proxy+}"
  rest_api_id = data.aws_api_gateway_rest_api.this.id
}

resource "aws_api_gateway_method" "this" {
  authorization        = var.authorizer == null ? "NONE" : var.authorizer.type
  http_method          = "ANY"
  resource_id          = aws_api_gateway_resource.this.id
  rest_api_id          = data.aws_api_gateway_rest_api.this.id
  authorizer_id        = var.authorizer == null ? null : var.authorizer.id
  authorization_scopes = var.authorizer == null ? null : var.authorizer.oauth_scopes
}

resource "aws_api_gateway_integration" "this" {
  http_method             = aws_api_gateway_method.this.http_method
  resource_id             = aws_api_gateway_resource.this.id
  rest_api_id             = data.aws_api_gateway_rest_api.this.id
  type                    = "AWS_PROXY"
  integration_http_method = "POST"
  uri                     = data.aws_lambda_function.this.invoke_arn

}

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

resource "aws_lambda_permission" "apigw_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = var.function_name
  principal     = "apigateway.amazonaws.com"
  qualifier     = var.function_qualifier

  # More: http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-control-access-using-iam-policies-to-invoke-api.html
  source_arn = "arn:aws:execute-api:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:${data.aws_api_gateway_rest_api.this.id}/*/*"
}

