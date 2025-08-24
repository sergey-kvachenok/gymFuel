provider "aws" {
  region = "us-east-1"
}

# Create VPC
module "vpc" {
  source = "../modules/vpc"
  
  environment        = "test"
  vpc_cidr          = "10.0.0.0/16"
  availability_zones = ["us-east-1a", "us-east-1b"]
  app_name = "gymFuel"
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
  app_name = "gymFuel"
}

# Create Elastic Beanstalk environment
module "elastic_beanstalk" {
  source = "../modules/elastic-beanstalk"
  
  environment        = "test"
  app_name          = "vibe"
  vpc_id            = module.vpc.vpc_id
  public_subnet_ids = module.vpc.public_subnet_ids
  private_subnet_ids = module.vpc.private_subnet_ids
  database_url      = module.rds.database_url
  instance_type     = "t3.small"
  min_size          = 1
  max_size          = 2
  nextauth_secret   = "test-nextauth-secret-123"
}

# Show outputs
output "database_endpoint" {
  value = module.rds.endpoint
}

output "application_url" {
  value = module.elastic_beanstalk.application_url
}