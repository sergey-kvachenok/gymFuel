# S3 Bucket for deployment artifacts
resource "aws_s3_bucket" "deployments" {
 bucket = "${lower(var.app_name)}-deployments-${var.environment}"  

  tags = {
    Name        = "${var.app_name}-deployments-${var.environment}"
    Environment = var.environment
  }
}

# Enable versioning
resource "aws_s3_bucket_versioning" "deployments" {
  bucket = aws_s3_bucket.deployments.id
  versioning_configuration {
    status = "Disabled"
  }
}

# Block public access
resource "aws_s3_bucket_public_access_block" "deployments" {
  bucket = aws_s3_bucket.deployments.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}