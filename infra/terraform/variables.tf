variable "aws_account_id" {
  description = "The AWS account ID Terraform is permitted to manage."
  type        = string

  validation {
    condition     = can(regex("^[0-9]{12}$", var.aws_account_id))
    error_message = "aws_account_id must be a 12-digit AWS account ID."
  }
}

variable "aws_region" {
  description = "AWS region for the production application."
  type        = string
  default     = "ap-south-1"
}

variable "instance_type" {
  description = "Initial EC2 size; start small and resize based on monitoring."
  type        = string
  default     = "t3.small"
}

variable "github_repository" {
  description = "GitHub repository allowed to deploy, in OWNER/REPOSITORY form."
  type        = string
  default     = "DrJanvi/youniq-lyf"

  validation {
    condition     = can(regex("^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$", var.github_repository))
    error_message = "github_repository must be in OWNER/REPOSITORY form."
  }
}

variable "github_repository_owner_id" {
  description = "Immutable GitHub owner ID used in this repository's OIDC subject."
  type        = string
  default     = "351821301"

  validation {
    condition     = can(regex("^[0-9]+$", var.github_repository_owner_id))
    error_message = "github_repository_owner_id must be a numeric GitHub ID."
  }
}

variable "github_repository_id" {
  description = "Immutable GitHub repository ID used in this repository's OIDC subject."
  type        = string
  default     = "1444044988"

  validation {
    condition     = can(regex("^[0-9]+$", var.github_repository_id))
    error_message = "github_repository_id must be a numeric GitHub ID."
  }
}

variable "github_environment_name" {
  description = "GitHub Environment used by the production deployment job."
  type        = string
  default     = "production"
}

variable "domain_name" {
  description = "Primary domain for the application; DNS is managed outside AWS."
  type        = string

  validation {
    condition     = can(regex("^[A-Za-z0-9]([A-Za-z0-9.-]*[A-Za-z0-9])?$", var.domain_name))
    error_message = "domain_name must contain only DNS hostname characters."
  }
}

variable "additional_domains" {
  description = "Optional additional hostnames covered by the same Certbot certificate."
  type        = list(string)
  default     = []

  validation {
    condition     = alltrue([for domain in var.additional_domains : can(regex("^[A-Za-z0-9]([A-Za-z0-9.-]*[A-Za-z0-9])?$", domain))])
    error_message = "Every additional domain must contain only DNS hostname characters."
  }
}

variable "acme_email" {
  description = "Contact email used when requesting the Let's Encrypt certificate."
  type        = string

  validation {
    condition     = can(regex("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$", var.acme_email))
    error_message = "acme_email must be a valid email address."
  }
}

variable "parameter_path" {
  description = "SSM Parameter Store path containing application runtime values."
  type        = string
  default     = "/youniqlyf/production"

  validation {
    condition     = can(regex("^(/[A-Za-z0-9_.-]+)+$", var.parameter_path))
    error_message = "parameter_path must be a slash-prefixed path containing letters, digits, dot, underscore, or hyphen."
  }
}

variable "root_volume_size_gb" {
  description = "Encrypted gp3 root volume size."
  type        = number
  default     = 20

  validation {
    condition     = var.root_volume_size_gb >= 20
    error_message = "root_volume_size_gb must be at least 20 GiB."
  }
}
