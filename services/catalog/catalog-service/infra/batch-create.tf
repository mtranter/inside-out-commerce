resource "aws_sqs_queue" "batch_create_queue" {
  name                       = "${var.project_name}-${var.environment}-${var.service_name}-batch-create-products"
  visibility_timeout_seconds = 3
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.batch_create_queue_deadletter.arn
    maxReceiveCount     = 3
  })
}

resource "aws_sqs_queue" "batch_create_queue_deadletter" {
  name = "${var.project_name}-${var.environment}-${var.service_name}-batch-create-products-deadletter"
}

data "archive_file" "sqs_handler" {
  output_path = "${path.module}/sqs-handler.zip"
  source_file = "${path.module}/../dist/batch-create-products-handler.js"
  type        = "zip"
}

module "create_products_sqs_handler_function" {
  source           = "github.com/mtranter/platform-in-a-box-aws//modules/terraform-aws-piab-lambda"
  name             = "${var.service_name}-batch-create-${var.environment}"
  service_name     = "${var.project_name}-${var.project_name}"
  runtime          = "nodejs18.x"
  handler          = "lambda.handler"
  filename         = data.archive_file.sqs_handler.output_path
  source_code_hash = data.archive_file.sqs_handler.output_base64sha256
  timeout          = 3
  create_dlq       = true
  environment_vars = local.lambda_env_vars
}

resource "aws_iam_role_policy_attachment" "batch_created_allow_dynamodb" {
  role       = module.create_products_sqs_handler_function.execution_role.id
  policy_arn = aws_iam_policy.allow_dynamodb.arn
}

resource "aws_lambda_event_source_mapping" "example" {
  event_source_arn = aws_sqs_queue.batch_create_queue.arn
  function_name    = module.create_products_sqs_handler_function.function.name

  depends_on = [module.create_products_sqs_handler_function]
}

resource "aws_lambda_permission" "allow_sqs" {
  statement_id  = "AllowExecutionFromSQS"
  action        = "lambda:InvokeFunction"
  function_name = module.create_products_sqs_handler_function.function.name
  principal     = "sqs.amazonaws.com"
  source_arn    = aws_sqs_queue.batch_create_queue.arn
}

resource "aws_iam_role_policy" "batch_handler_allow_sqs" {
  role       = module.create_products_sqs_handler_function.execution_role.id
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "sqs:ReceiveMessage",
        "sqs:DeleteMessage",
        "sqs:GetQueueAttributes"
      ],
      "Resource": "${aws_sqs_queue.batch_create_queue.arn}"
    }
  ]
}
EOF
}
