terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.63.0"
    }
    confluent = {
      source  = "confluentinc/confluent"
      version = "~> 1.39.0"
    }
  }
  backend "s3" {
      bucket = "super-in-a-box-tfstate"
      key    = "siab-aws-confluent/services/public-member-api/terraform.tfstate"
      region = "ap-southeast-2"
  }
}
