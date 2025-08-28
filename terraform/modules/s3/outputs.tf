output "bucket_name" {
  description = "S3 bucket name for deployment artifacts"
  value       = aws_s3_bucket.deployments.bucket
}

output "bucket_arn" {
  description = "S3 bucket ARN"
  value       = aws_s3_bucket.deployments.arn
}