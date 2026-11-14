output "aws_account_id" {
  description = "Pinned production AWS account ID."
  value       = var.aws_account_id
}

output "aws_region" {
  description = "Production AWS region."
  value       = var.aws_region
}

output "instance_id" {
  description = "EC2 instance ID; use this when reviewing Systems Manager deployments."
  value       = aws_instance.application.id
}

output "elastic_ip" {
  description = "Static IPv4 address to add as the domain's external DNS A record."
  value       = aws_eip.application.public_ip
}

output "artifact_bucket" {
  description = "Private S3 bucket used to transfer release artifacts."
  value       = aws_s3_bucket.releases.bucket
}

output "github_deploy_role_arn" {
  description = "IAM role ARN to set as the GitHub production environment variable AWS_ROLE_ARN."
  value       = aws_iam_role.github_deploy.arn
}

output "parameter_path" {
  description = "SSM Parameter Store path for runtime application values."
  value       = var.parameter_path
}
