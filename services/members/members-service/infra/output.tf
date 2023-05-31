// api live stage URL
output "test_client_id" {
  value = aws_cognito_user_pool_client.this.id
}

output "test_client_secret" {
  value = aws_cognito_user_pool_client.this.client_secret
  sensitive = true
}

output "api_url" {
  value = aws_api_gateway_stage.this.invoke_url
}
