variable "environment" {
  description = "Environment name (e.g., staging, production)"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID where the database will be created"
  type        = string
}

variable "subnet_ids" {
  description = "List of private subnet IDs for the database"
  type        = list(string)
}

variable "db_name" {
  description = "Name of the database to create"
  type        = string
}

variable "db_username" {
  description = "Database administrator username"
  type        = string
}

variable "db_password" {
  description = "Database administrator password"
  type        = string
}

variable "instance_class" {
  description = "RDS instance class (determines CPU and memory)"
  type        = string
  default     = "db.t3.micro"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "gymFuel"
}
