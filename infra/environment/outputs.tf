output "kafka_cluster" {
  value = module.kafka_cluster.kafka_cluster
}

output "schema_registry" {
  value = module.kafka_cluster.schema_registry
}

output "admin_service_account" {
  value = module.kafka_cluster.admin_service_account
}

output "admin_api_key_id" {
  value = module.kafka_cluster.admin_api_key_id
}

output "admin_api_key_secret" {
  value = module.kafka_cluster.admin_api_key_secret
  sensitive = true
}
