output "identity_pool_id" {
  value = aws_cognito_identity_pool.main.id
}

output "user_pool_id" {
  value = data.aws_cognito_user_pools.this.ids[0]
}

output "user_pool_client_id" {
  value = aws_cognito_user_pool_client.userpool_client.id
}

output "api_role_arn" {
  value = aws_iam_role.web_identity_role.arn
}

output "catalog_api_url" {
    value = nonsensitive(data.aws_ssm_parameter.api_url.value)
}

output "auth_url" {
    value = nonsensitive(data.aws_ssm_parameter.auth_endpoint.value)
}

output "catalog_scope_id" {
  value = nonsensitive(aws_ssm_parameter.catalog_scope_id.value)
}