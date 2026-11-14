output "state_bucket" {
  description = "S3 backend bucket name for the application Terraform state."
  value       = aws_s3_bucket.state.bucket
}

output "aws_region" {
  description = "Region of the Terraform state bucket."
  value       = var.aws_region
}
