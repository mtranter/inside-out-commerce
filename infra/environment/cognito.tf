resource "aws_cognito_user_pool" "this" {
  name = "${var.project_name}-${var.environment}"
}


resource "aws_cognito_user_pool_domain" "main" {
  domain       = "${var.project_name}-${var.environment}"
  user_pool_id = aws_cognito_user_pool.this.id
}