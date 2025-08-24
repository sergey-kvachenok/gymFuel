# Configure the AWS Provider
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Configure the AWS Provider
provider "aws" {
  region = "us-east-1"
}

# VPC Module
module "vpc" {
  source = "../../modules/vpc"
  environment = "production"
  vpc_cidr = "10.1.0.0/16"
  availability_zones = ["us-east-1a", "us-east-1b"]
  app_name = "gymFuel"
}

# RDS Module
module "rds" {
  source = "../../modules/rds"
  
  environment = "production"
  vpc_id = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnet_ids
  db_name = var.db_name
  db_username = var.db_username
  db_password = var.db_password
  instance_class = "db.t3.micro"
  app_name = "gymFuel"
}

# Step 1: Create Elastic Beanstalk environment without nextauth_url
module "elastic_beanstalk" {
  source = "../../modules/elastic-beanstalk"
  environment = "production"
  app_name = "gymFuel"
  vpc_id = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  public_subnet_ids = module.vpc.public_subnet_ids
  database_url = module.rds.database_url
  nextauth_url = "https://placeholder.elasticbeanstalk.com"  # Placeholder
  nextauth_secret = var.nextauth_secret
  instance_type = "t3.micro"
  min_size = "1"
  max_size = "2"
}

# Step 2: Update the environment with the correct URL
resource "null_resource" "update_nextauth_url" {
  triggers = {
    environment_id = module.elastic_beanstalk.environment_id
  }

  provisioner "local-exec" {
    command = <<-EOT
      aws elasticbeanstalk update-environment \
        --environment-name ${module.elastic_beanstalk.environment_name} \
        --option-settings Namespace=aws:elasticbeanstalk:application:environment,OptionName=NEXTAUTH_URL,Value=https://${module.elastic_beanstalk.cname}
    EOT
  }

  depends_on = [module.elastic_beanstalk]
}

# Outputs
output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = module.vpc.private_subnet_ids
}

output "database_url" {
  description = "Database connection URL"
  value       = module.rds.database_url
  sensitive   = true
}

output "elastic_beanstalk_environment_name" {
  description = "Elastic Beanstalk environment name"
  value       = module.elastic_beanstalk.environment_name
}

output "elastic_beanstalk_cname" {
  description = "Elastic Beanstalk CNAME"
  value       = module.elastic_beanstalk.cname
}