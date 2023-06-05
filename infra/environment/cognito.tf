resource "aws_cognito_user_pool" "this" {
  name = "${var.project_name}-${var.environment}"
}


resource "aws_cognito_user_pool_domain" "main" {
  domain       = "${var.project_name}-${var.environment}"
  user_pool_id = aws_cognito_user_pool.this.id
}

data "aws_region" "current" {}

resource "aws_ssm_parameter" "cognito_auth_endpoint" {
  name  = "/${var.project_name}/${var.environment}/cognito/auth_endpoint"
  type  = "SecureString"
  value = "https://${var.project_name}-${var.environment}.auth.${data.aws_region.current.name}.amazoncognito.com"
}
