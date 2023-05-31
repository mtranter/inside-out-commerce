output "deployment_triggers" {
  value = [
    aws_api_gateway_resource.this.id,
    aws_api_gateway_method.this.id,
    aws_api_gateway_integration.this.id,
  ]
}
