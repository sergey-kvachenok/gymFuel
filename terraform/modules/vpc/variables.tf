variable "environment" {
  description = "Environment name (e.g., staging, production)"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC (e.g., 10.0.0.0/16)"
  type        = string
}


variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "gymFuel"
}