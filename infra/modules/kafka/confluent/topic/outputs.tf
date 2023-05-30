output "key_schema_id" {
  value = confluent_schema.key_schema.schema_identifier 
}

output "value_schema_id" {
  value = confluent_schema.value_schema.schema_identifier 
}
