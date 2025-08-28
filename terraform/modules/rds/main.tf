# Create a subnet group for the database
# RDS needs to know which subnets it can use
resource "aws_db_subnet_group" "main" {
  name       = "${lower(var.app_name)}-${var.environment}-db-subnet-group"
  subnet_ids = var.subnet_ids

  tags = {
    Name        = "${var.app_name}-${var.environment}-db-subnet-group"
    Environment = var.environment
  }
}


# Create a security group for the database
# This controls who can connect to the database
resource "aws_security_group" "rds" {
  name_prefix = "${var.app_name}-${var.environment}-rds-sg"
  vpc_id      = var.vpc_id

  # Allow PostgreSQL connections from the VPC
  # We'll update this later to only allow connections from Elastic Beanstalk
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]  # Allow from entire VPC for now
  }

  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.app_name}-${var.environment}-rds-sg"
    Environment = var.environment
  }
}

# Create the actual database instance
resource "aws_db_instance" "main" {
  identifier = "${lower(var.app_name)}-${var.environment}-db"

  # Database engine configuration
  engine         = "postgres"
  engine_version = "14.17"
  instance_class = var.instance_class

  # Storage configuration
  allocated_storage     = 20
  max_allocated_storage = 20
  storage_type          = "gp3"
  storage_encrypted     = false

  # Database credentials
  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  # Network configuration
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  # Backup configuration
  backup_retention_period = 1
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  # Final snapshot (for cleanup)
  skip_final_snapshot = true
  publicly_accessible    = false
  multi_az               = false
  final_snapshot_identifier = "${var.app_name}-${var.environment}-db-final-snapshot"

  tags = {
    Name        = "${var.app_name}-${var.environment}-db"
    Environment = var.environment
  }
}
