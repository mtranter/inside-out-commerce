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
  environment_vars = local.lambda_env_vars
}

resource "aws_iam_role_policy_attachment" "allow_dynamodb" {
  role       = module.api_function.execution_role.id
  policy_arn = aws_iam_policy.allow_dynamodb.arn
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

resource "aws_iam_policy" "allow_api" {
  name   = "${var.project_name}-${var.environment}-${var.service_name}-allow-api"
  policy = data.aws_iam_policy_document.allow_api.json
}

resource "aws_iam_role_policy" "api_allow_sqs" {
  role   = module.api_function.execution_role.id
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "sqs:SendMessage"
      ],
      "Resource": "${aws_sqs_queue.batch_create_queue.arn}"
    }
  ]
}
EOF
}


resource "aws_cognito_resource_server" "api" {
  identifier = "https://${local.api_subdomain}.${var.project_name}.com"
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

resource "aws_api_gateway_method_settings" "this" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  stage_name  = aws_api_gateway_stage.this.stage_name
  method_path = "*/*"
  settings {
    logging_level      = "INFO"
    data_trace_enabled = true
    metrics_enabled    = true
  }
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

module "api_integration" {
  source        = "../../../../infra/modules/aws/lambda-proxy-api"
  api_name      = aws_api_gateway_rest_api.this.name
  function_name = module.api_function.function.id
  authorizer = {
    type = "AWS_IAM"
  }

  depends_on = [aws_api_gateway_rest_api.this]
}

resource "aws_ssm_parameter" "schema_registry_endpoint" {
  name  = "/${var.project_name}/${var.environment}/${var.service_name}/api_url"
  type  = "String"
  value = aws_api_gateway_stage.this.invoke_url
}

resource "aws_ssm_parameter" "api_execution_arn" {
  name  = "/${var.project_name}/${var.environment}/${var.service_name}/api_execution_arn"
  type  = "String"
  value = aws_api_gateway_rest_api.this.execution_arn
}

resource "aws_ssm_parameter" "api_scope_id" {
  name  = "/${var.project_name}/${var.environment}/${var.service_name}/api_scope_id"
  type  = "String"
  value = aws_cognito_resource_server.api.scope_identifiers[0]
}
