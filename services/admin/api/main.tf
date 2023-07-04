locals {
  stage_name = "live"
}

data "aws_ssm_parameter" "catalog_service_endpoint" {
  name = "/${var.project_name}/${var.environment}/catalog-service/api_url"
}

resource "aws_api_gateway_rest_api" "this" {
  name = "${var.project_name}-${var.environment}-${var.service_name}"
}

resource "aws_api_gateway_deployment" "this" {
  rest_api_id = aws_api_gateway_rest_api.this.id

  triggers = {
    redeployment = sha1(jsonencode([
      module.catalog_api.parent_integration,
      module.catalog_api.proxy_integration,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_cloudwatch_log_group" "api_logs" {
  name              = "/api/${var.project_name}-${var.environment}-${var.service_name}/${local.stage_name}"
  retention_in_days = 1
}

resource "aws_api_gateway_stage" "this" {
  deployment_id        = aws_api_gateway_deployment.this.id
  rest_api_id          = aws_api_gateway_rest_api.this.id
  stage_name           = local.stage_name
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

module "catalog_api" {
  source             = "./proxy_integration"
  rest_api_id        = aws_api_gateway_rest_api.this.id
  parent_resource_id = aws_api_gateway_rest_api.this.root_resource_id
  prefix             = "catalog"
  uri                = data.aws_ssm_parameter.catalog_service_endpoint.value
}
