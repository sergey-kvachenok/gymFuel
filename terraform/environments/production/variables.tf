variable "db_name" {
  description = "Database name"
  type        = string
  default     = "gymFuel"
}

variable "db_username" {
  description = "Database username"
  type        = string
  default     = "gymFuel_admin"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "nextauth_secret" {
  description = "NextAuth secret"
  type        = string
  sensitive   = true
}