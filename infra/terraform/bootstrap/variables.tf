variable "aws_account_id" {
  description = "The AWS account ID where the Terraform state bucket will be created."
  type        = string

  validation {
    condition     = can(regex("^[0-9]{12}$", var.aws_account_id))
    error_message = "aws_account_id must be a 12-digit AWS account ID."
  }
}

variable "aws_region" {
  description = "Region containing the Terraform state bucket."
  type        = string
  default     = "ap-south-1"
}
