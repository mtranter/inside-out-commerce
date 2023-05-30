output "schema_registry" {
  value = confluent_schema_registry_cluster.essentials
}

output "schema_manager_api_key_id" {
  value = confluent_api_key.schema_manager_api_key.id
}

output "schema_manager_api_key_secret" {
  value = confluent_api_key.schema_manager_api_key.secret
}
