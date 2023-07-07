locals {
  catalog_scope = "https://catalog.${var.project_name}.com/api.execute"
}

data "aws_region" "current" {}

data "aws_acm_certificate" "acm_cert" {
  domain   = "*.${var.hosted_zone_name}"
  provider = aws.us
  statuses = [
    "ISSUED",
  ]
}

module "cdn" {
  source = "cloudposse/cloudfront-s3-cdn/aws"

  version                           = "0.90.0"
  namespace                         = var.project_name
  stage                             = var.environment
  name                              = var.service_name
  aliases                           = ["${var.subdomain}.${var.hosted_zone_name}"]
  dns_alias_enabled                 = true
  parent_zone_name                  = var.hosted_zone_name
  cloudfront_access_logging_enabled = false

  acm_certificate_arn = data.aws_acm_certificate.acm_cert.arn
}

data "aws_cognito_user_pools" "this" {
  name = "${var.project_name}-${var.environment}"
}

resource "aws_cognito_user_pool_client" "userpool_client" {
  name                                 = "admin-client"
  user_pool_id                         = data.aws_cognito_user_pools.this.ids[0]
  callback_urls                        = ["https://${var.subdomain}.${var.hosted_zone_name}", "http://localhost:3000"]
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["email", "openid", local.catalog_scope]
  supported_identity_providers         = ["COGNITO"]
}

resource "aws_cognito_identity_pool" "main" {
  identity_pool_name               = "${var.project_name}-${var.environment}-AdminIdentityPool"
  allow_unauthenticated_identities = false
  allow_classic_flow               = false

  cognito_identity_providers {
    client_id               = aws_cognito_user_pool_client.userpool_client.id
    provider_name           = "cognito-idp.${data.aws_region.current.name}.amazonaws.com/${data.aws_cognito_user_pools.this.ids[0]}"
    server_side_token_check = false
  }
}

resource "aws_iam_role" "web_identity_role" {
  name               = "${var.project_name}-${var.environment}-${var.service_name}-web-identity"
  assume_role_policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": {
        "Effect": "Allow",
        "Principal": {"Federated": "cognito-identity.amazonaws.com"},
        "Action": "sts:AssumeRoleWithWebIdentity",
        "Condition": {
            "StringEquals": {"cognito-identity.amazonaws.com:aud": "us-east-2:12345678-abcd-abcd-abcd-123456"},
            "StringEquals": {"cognito-identity.amazonaws.com:client_id": "${aws_cognito_user_pool_client.userpool_client.id}"}
        }
    }
}
EOF
}
