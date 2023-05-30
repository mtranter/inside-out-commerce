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
      bucket = "inside-out-bank-tfstate"
      key    = "environment/terraform.tfstate"
      region = "ap-southeast-2"
  }
}
