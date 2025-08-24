output "environment_id" {
  description = "Elastic Beanstalk environment ID"
  value       = aws_elastic_beanstalk_environment.main.id
}

output "environment_name" {
  description = "Elastic Beanstalk environment name"
  value       = aws_elastic_beanstalk_environment.main.name
}

output "cname" {
  description = "Elastic Beanstalk environment CNAME"
  value       = aws_elastic_beanstalk_environment.main.cname
}

output "application_name" {
  description = "Elastic Beanstalk application name"
  value       = aws_elastic_beanstalk_application.main.name
}

output "application_url" {
  description = "URL where your application is accessible"
  value       = "https://${aws_elastic_beanstalk_environment.main.cname}"
}