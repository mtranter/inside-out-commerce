output "deployment_triggers" {
  value = [
    jsonencode(aws_api_gateway_method._),
    jsonencode(aws_api_gateway_integration._),
  ]
}
