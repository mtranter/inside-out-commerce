terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.63.0"
    }
  }
  backend "s3" {
      bucket = "inside-out-commerce-tfstate"
      key    = "services/admin-api/terraform.tfstate"
      region = "ap-southeast-2"
  }
}
