
output "admin_service_account" {
  value = module.user.service_account
}

output "admin_api_key_id" {
  value = module.user.api_key_id
}

output "admin_api_key_secret" {
  value = module.user.api_key_secret
}

output "kafka_cluster" {
  value = confluent_kafka_cluster.cluster
}

output "schema_registry" {
  value = module.schema_registry.schema_registry
}

output "schema_manager_api_key_id" {
  value = module.schema_registry.schema_manager_api_key_id
}

output "schema_manager_api_key_secret" {
  value = module.schema_registry.schema_manager_api_key_secret
}

output "environment_id" {
  value = var.create_environment ? confluent_environment.env[0].id : data.confluent_environment.env[0].id
}

output "bootstrap_endpoint" {
  value = module.kafka_cluster.bootstrap_endpoint 
}