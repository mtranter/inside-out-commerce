resource "confluent_kafka_acl" "describe-basic-cluster" {
  resource_type = var.resource_type
  resource_name = var.resource_name
  pattern_type  = var.resource_name_is_prefix ? "PREFIXED" : "LITERAL"
  principal     = "User:${var.user_id}"
  host          = var.host
  operation     = var.operation
  permission    = var.permission
}
