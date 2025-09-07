# Create the Elastic Beanstalk application
resource "aws_elastic_beanstalk_application" "main" {
  name        = var.app_name
  description = "GymFuel nutrition tracking application"
}

# IAM role for EC2 instances
resource "aws_iam_role" "eb_instance_role" {
  name = "${var.environment}-eb-instance-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

# IAM instance profile (attaches the role to EC2 instances)
resource "aws_iam_instance_profile" "eb_instance_profile" {
  name = "${var.environment}-eb-instance-profile"
  role = aws_iam_role.eb_instance_role.name
}

# Attach necessary policies to the role
resource "aws_iam_role_policy_attachment" "eb_instance_role_policy" {
  role       = aws_iam_role.eb_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier"
}

