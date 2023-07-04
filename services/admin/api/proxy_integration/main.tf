variable "uri" {
  type = string
}

variable "prefix" {
  type = string
}

variable "rest_api_id" {
  type = string
}

variable "parent_resource_id" {
  type = string
}

resource "aws_api_gateway_resource" "parent" {
  rest_api_id = var.rest_api_id
  parent_id   = var.parent_resource_id
  path_part   = var.prefix
}


resource "aws_api_gateway_method" "parent" {
  rest_api_id   = var.rest_api_id
  resource_id   = aws_api_gateway_resource.parent.id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "parent" {
  rest_api_id             = var.rest_api_id
  resource_id             = aws_api_gateway_resource.parent.id
  http_method             = aws_api_gateway_method.parent.http_method
  integration_http_method = "ANY"
  type                    = "HTTP_PROXY"
  uri                     = var.uri
}

resource "aws_api_gateway_resource" "proxy" {
  rest_api_id = var.rest_api_id
  parent_id   = aws_api_gateway_resource.parent.id
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "proxy" {
  rest_api_id   = var.rest_api_id
  resource_id   = aws_api_gateway_resource.proxy.id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "proxy" {
  rest_api_id             = var.rest_api_id
  resource_id             = aws_api_gateway_resource.proxy.id
  http_method             = aws_api_gateway_method.proxy.http_method
  type                    = "HTTP_PROXY"
  integration_http_method = "ANY"
  uri                     = var.uri
}

// outputs
output "parent_integration" {
  value = aws_api_gateway_integration.parent
}

output "proxy_integration" {
  value = aws_api_gateway_integration.proxy
}
