terraform {
  required_version = ">= 1.10.0, < 2.0.0"

  backend "s3" {
    use_lockfile = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region              = var.aws_region
  allowed_account_ids = [var.aws_account_id]

  default_tags {
    tags = {
      Application = "youniqlyf"
      Environment = "production"
      ManagedBy   = "Terraform"
    }
  }
}

data "aws_caller_identity" "current" {}
