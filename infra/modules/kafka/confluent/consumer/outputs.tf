
// api key output
output "api_key_id" {
  value = module.user.api_key_id
}

output "api_key_secret" {
  value =  module.user.api_key_secret
  sensitive = true
}

output "service_account" {
    value = module.user.service_account
}

output "schema_registry_api_key_id" {
  value = confluent_api_key.schema_manager_api_key.id
}

output "schema_registry_api_key_secret" {
  value = confluent_api_key.schema_manager_api_key.secret
}