resource "aws_cognito_user_pool" "this" {
  name = "${var.project_name}-${var.environment}"
}
