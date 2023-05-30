terraform {
  required_providers {
    confluent = {
      source  = "confluentinc/confluent"
      version = ">= 1.39.0"
    }
    aws = {
      source  = "hashicorp/aws"
      version = ">= 4.0.0"
    }
  }
}
