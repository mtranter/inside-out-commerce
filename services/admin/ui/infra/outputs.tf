output "identity_pool_id" {
  value = aws_cognito_identity_pool.main.id
}

output "user_pool_id" {
  value = data.aws_cognito_user_pools.this.ids[0]
}

output "api_role_arn" {
  value = aws_iam_role.web_identity_role.arn
}

output "catalog_api_url" {
    value = nonsensitive(data.aws_ssm_parameter.api_url.value)
}