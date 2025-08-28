variable "environment" {
  description = "Environment name (e.g., staging, production)"
  type        = string
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "gymFuel"
}