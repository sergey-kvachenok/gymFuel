# Create the Elastic Beanstalk application
resource "aws_elastic_beanstalk_application" "main" {
  name        = var.app_name
  description = "GymFuel nutrition tracking application"
}

# Create the Elastic Beanstalk environment
resource "aws_elastic_beanstalk_environment" "main" {
  name                = "${var.environment}-${var.app_name}"
  application         = aws_elastic_beanstalk_application.main.name
  solution_stack_name = "64bit Amazon Linux 2023 v6.6.4 running Node.js 20"

    # Prevent recreation on configuration changes
  lifecycle {
    ignore_changes = [
      setting,
    ]
  }
  # IAM role for EC2 instances
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = aws_iam_instance_profile.eb_instance_profile.name
  }

  # Instance type configuration
  setting {
    namespace = "aws:ec2:instances"
    name      = "InstanceTypes"
    value     = var.instance_type
  }

  # Auto-scaling configuration
  setting {
    namespace = "aws:autoscaling:asg"
    name      = "MinSize"
    value     = var.min_size
  }

  setting {
    namespace = "aws:autoscaling:asg"
    name      = "MaxSize"
    value     = var.max_size
  }

  # Load balancer configuration
  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "LoadBalancerType"
    value     = "application"
  }

  # Environment variables for your application
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "NODE_ENV"
    value     = var.environment
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "DATABASE_URL"
    value     = var.database_url
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "NEXT_PUBLIC_APP_ENV"
    value     = var.environment
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "NEXTAUTH_URL"
    value     = var.nextauth_url
  }

 # Environment variables for your application
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "NEXTAUTH_SECRET"
    value     = var.nextauth_secret
  }

  # VPC configuration
  setting {
    namespace = "aws:ec2:vpc"
    name      = "VPCId"
    value     = var.vpc_id
  }

  setting {
    namespace = "aws:ec2:vpc"
    name      = "Subnets"
    value     = join(",", var.private_subnet_ids)
  }

  setting {
    namespace = "aws:ec2:vpc"
    name      = "ELBScheme"
    value     = "public"
}
 
 setting {
  namespace = "aws:ec2:vpc"
  name      = "ELBSubnets"
  value     = join(",", var.public_subnet_ids)  # Load balancer in public subnets
}

# Add this to disable public IP assignment
setting {
  namespace = "aws:ec2:vpc"
  name      = "AssociatePublicIpAddress"
  value     = "false"
}
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

