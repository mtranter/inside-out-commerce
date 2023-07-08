output "deployment_triggers" {
  value = concat([
    jsonencode(aws_api_gateway_resource.this),
    jsonencode(aws_api_gateway_method.this),
    jsonencode(aws_api_gateway_integration.this),
  ], module.cors.deployment_triggers)
}
