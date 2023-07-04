data "archive_file" "api" {
  output_path = "${path.module}/api.zip"
  source_file = "${path.module}/../dist/lambda.js"
  type        = "zip"
}

module "api_function" {
  source           = "github.com/mtranter/platform-in-a-box-aws//modules/terraform-aws-piab-lambda"
  name             = "${var.service_name}-api-${var.environment}"
  service_name     = "${var.project_name}-${var.project_name}"
  runtime          = "nodejs18.x"
  handler          = "lambda.handler"
  filename         = data.archive_file.api.output_path
  source_code_hash = data.archive_file.api.output_base64sha256
  timeout          = 10
  layers           = []
  create_dlq       = false
  tags             = {}
  environment_vars = {
    API_STAGE                = local.stage_name
    TABLE_NAME               = module.dynamodb.table.id
    EVENTS_TOPIC             = local.topic_name
    KEY_SCHEMA_ID            = module.events_topic.key_schema_id
    VALUE_SCHEMA_ID          = module.events_topic.value_schema_id
    SCHEMA_REGISTRY_HOST     = data.aws_ssm_parameter.schema_registry_endpoint.value
    SCHEMA_REGISTRY_USERNAME = data.aws_ssm_parameter.schema_registry_username.value
    SCHEMA_REGISTRY_PASSWORD = data.aws_ssm_parameter.schema_registry_password.value
    ID_TOKEN_ENDPOINT        = "https://${var.project_name}-${var.environment}.auth.${data.aws_region.current.name}.amazoncognito.com/oauth2/token"
    TEST_CLIENT_ID           = aws_cognito_user_pool_client.this.id

  }
}

resource "aws_iam_role_policy_attachment" "allow_dynamodb" {
  role   = module.api_function.execution_role.id
  policy_arn = aws_iam_policy.allow_dynamodb.arn
}

resource "aws_cognito_resource_server" "api" {
  identifier = "https://${local.api_subdomain}.inside-out-commerce.com"
  name       = "${var.project_name}-${var.service_name}-${var.environment}"

  scope {
    scope_name        = local.execute_scope
    scope_description = "Use the API"
  }

  user_pool_id = data.aws_cognito_user_pools.this.ids[0]
}

resource "aws_api_gateway_rest_api" "this" {
  name = "${var.project_name}-${var.service_name}-${var.environment}"
}

resource "aws_api_gateway_authorizer" "this" {
  name          = "${var.project_name}-${var.service_name}-${var.environment}"
  rest_api_id   = aws_api_gateway_rest_api.this.id
  type          = "COGNITO_USER_POOLS"
  provider_arns = [data.aws_cognito_user_pools.this.arns[0]]
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

resource "aws_cloudwatch_log_group" "api_logs" {
  name              = "/api/${var.project_name}-${var.service_name}-${var.environment}/${local.stage_name}" 
  retention_in_days = 1
}

resource "aws_api_gateway_stage" "this" {
  deployment_id = aws_api_gateway_deployment.this.id
  rest_api_id   = aws_api_gateway_rest_api.this.id
  stage_name    = local.stage_name
  xray_tracing_enabled = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_logs.arn
    format = replace(<<EOF
{ "requestId":"$context.requestId",
  "ip": "$context.identity.sourceIp",
  "caller":"$context.identity.caller",
  "user":"$context.identity.user",
  "requestTime":"$context.requestTime",
  "httpMethod":"$context.httpMethod",
  "resourcePath":"$context.resourcePath",
  "path":"$context.path",
  "status":"$context.status",
  "protocol":"$context.protocol",
  "error": "$context.error.message",
  "integrationError": "$context.integrationErrorMessage",
  "xrayTraceId": "$context.xrayTraceId",
  "integrationLatency": "$context.integration.latency",
  "responseLatency": "$context.responseLatency"
}
EOF
    , "\n", "")
  }
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

resource "aws_ssm_parameter" "schema_registry_endpoint" {
  name  = "/${var.project_name}/${var.environment}/${var.service_name}/api_url"
  type  = "String"
  value = aws_api_gateway_stage.this.invoke_url
}