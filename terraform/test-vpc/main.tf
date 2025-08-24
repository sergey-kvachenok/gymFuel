# This is a test file to understand VPC creation

# Tell Terraform to use AWS
provider "aws" {
  region = "us-east-1"
}

# Create a VPC using our module
module "vpc" {
  source = "../modules/vpc"
  
  environment = "test"
  vpc_cidr    = "10.0.0.0/16"
  availability_zones = ["us-east-1a", "us-east-1b"]
}

# Show us what was created
output "vpc_id" {
  value = module.vpc.vpc_id
}

output "public_subnet_ids" {
  value = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  value = module.vpc.private_subnet_ids
}