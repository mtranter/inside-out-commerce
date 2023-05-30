// api live stage URL
output "api_url" {
  value = module.api_integration.api_url
}

output "test_client_id" {
  value = aws_cognito_user_pool_client.this.id
}

output "test_client_secret" {
  value = aws_cognito_user_pool_client.this.client_secret
  sensitive = true
}
