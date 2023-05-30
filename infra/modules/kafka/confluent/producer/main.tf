data "confluent_service_account" "user" {
  id = var.user_id
}

module "acl" {
  for_each = toset([
    "WRITE",
    "DESCRIBE",
    "DESCRIBE_CONFIGS",
  "IDEMPOTENT_WRITE"])
  source                  = "./../acl"
  resource_type           = "TOPIC"
  resource_name           = var.topic_prefix
  resource_name_is_prefix = true
  user_id                 = var.user_id
  operation               = each.value
}

resource "confluent_role_binding" "schema_registry_read" {
  principal   = "User:${var.user_id}"
  role_name   = "DeveloperRead"
  crn_pattern = "${data.confluent_schema_registry_cluster.schema_registry.resource_name}/subject=${var.topic_prefix}*"
}

data "confluent_schema_registry_cluster" "schema_registry" {
  id = var.schema_registry_cluster_id
  environment {
    id = var.environment_id
  }
}

resource "confluent_api_key" "schema_manager_api_key" {
  display_name = "${data.confluent_service_account.user.display_name}-schema-registry-api-key"
  description  = "Schema Registry API Key that is owned by '${data.confluent_service_account.user.display_name}' service account"
  owner {
    id          = data.confluent_service_account.user.id
    api_version = data.confluent_service_account.user.api_version
    kind        = data.confluent_service_account.user.kind
  }

  managed_resource {
    id          = var.schema_registry_cluster_id
    api_version = data.confluent_schema_registry_cluster.schema_registry.api_version
    kind        = data.confluent_schema_registry_cluster.schema_registry.kind

    environment {
      id = var.environment_id
    }
  }
}
