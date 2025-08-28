provider "aws" {
  region = "us-east-1"
}

# Create VPC first (we need it for RDS)
module "vpc" {
  source = "../modules/vpc"
  
  environment        = "test"
  vpc_cidr          = "10.0.0.0/16"
  availability_zones = ["us-east-1a", "us-east-1b"]
}

# Create RDS database
module "rds" {
  source = "../modules/rds"
  
  environment     = "test"
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnet_ids
  db_name         = "vibe_test_db"
  db_username     = "vibe_user"
  db_password     = "test_password_123"
  instance_class  = "db.t3.micro"
}

# Show outputs
output "database_endpoint" {
  value = module.rds.endpoint
}

output "database_url" {
  value = module.rds.database_url
  sensitive = true
}