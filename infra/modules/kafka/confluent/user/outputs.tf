
// api key output
output "api_key_id" {
  value = confluent_api_key.this.id
}

output "api_key_secret" {
  value = confluent_api_key.this.secret
  sensitive = true
}

output "service_account" {
    value = confluent_service_account.this
}