
data "archive_file" "tx_outbox" {
  output_path = "${path.module}/api.zip"
  source_file = "${path.module}/../dist/tx-outbox-handler.js"
  type        = "zip"
}

data "aws_ssm_parameter" "kafka_cluster_endpoint" {
  name = "/${var.project_name}/kafka/${var.environment}/cluster/endpoint"
}

module "streams_handler" {
  source       = "github.com/mtranter/platform-in-a-box-aws//modules/terraform-aws-piab-lambda"
  name         = "${var.project_name}-${var.environment}-DynamoEventDispatcher"
  service_name = var.service_name
  runtime      = "nodejs18.x"
  handler      = "tx-outbox-handler.handler"
  filename     = data.archive_file.tx_outbox.output_path

  create_dlq = true
  environment_vars = {
    KAFKA_BROKERS  = data.aws_ssm_parameter.kafka_cluster_endpoint.value
    KAFKA_USERNAME = module.kafka.api_key_id
    KAFKA_PASSWORD = module.kafka.api_key_secret
  }
}

resource "aws_iam_role_policy" "events_handler_can_dynamo" {
  name   = "${var.project_name}-${var.environment}-DynamoEventDispatcher"
  role   = module.streams_handler.execution_role.id
  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowLambdaFunctionInvocation",
            "Effect": "Allow",
            "Action": [
                "lambda:InvokeFunction"
            ],
            "Resource": [
                "${module.streams_handler.function.arn}"
            ]
        },
        {
            "Sid": "APIAccessForDynamoDBStreams",
            "Effect": "Allow",
            "Action": [
                "dynamodb:GetRecords",
                "dynamodb:GetShardIterator",
                "dynamodb:DescribeStream",
                "dynamodb:ListStreams"
            ],
            "Resource": "${data.aws_dynamodb_table.table.arn}/stream/*"
        }
    ]
}
EOF
}


resource "aws_lambda_event_source_mapping" "streams_source" {
  event_source_arn  = module.dynamodb.table.stream_arn
  function_name     = module.streams_handler.function.arn
  starting_position = "TRIM_HORIZON"
  filter_criteria {
    filter {
      pattern = jsonencode({
        eventName = ["INSERT"]
        dynamodb = {
          NewImage = {
            isEvent = {
              BOOL = [true]
            }
          }
        }
      })
    }
  }

}
