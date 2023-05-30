
data "aws_ssm_parameter" "conflient_api_key" {
    name = "/confluent/cloud-api/key"
}

data "aws_ssm_parameter" "conflient_api_secret" {
    name = "/confluent/cloud-api/secret"
}

provider "confluent" {
  cloud_api_key    = data.aws_ssm_parameter.conflient_api_key.value
  cloud_api_secret = data.aws_ssm_parameter.conflient_api_secret.value
}

provider "aws" {
  region = "ap-southeast-2"
}