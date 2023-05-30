locals {
  read_acls  = ["READ", "DESCRIBE"]
  topic_acls = flatten([for t in var.topics : [for o in local.read_acls : { topic = t, operation = o }]])
}

data "confluent_service_account" "user" {
  id = var.user_id
}

module "acl" {
  for_each = {
    for tag in local.topic_acls : "${tag.topic}-${tag.operation}" => { operation = tag.operation, topic = tag.topic }
  }
  source                  = "./../acl"
  resource_type           = "TOPIC"
  resource_name           = each.value.topic
  resource_name_is_prefix = false
  user_id                 = data.confluent_service_account.user.id
  operation               = each.value.operation
}


module "group_acl" {
  for_each                = toset(local.read_acls)
  source                  = "./../acl"
  resource_type           = "GROUP"
  resource_name           = var.consumer_group_id
  resource_name_is_prefix = false
  user_id                 = data.confluent_service_account.user.id
  operation               = each.value
}

resource "confluent_role_binding" "schema_registry_read" {
  for_each    = toset(var.topics)
  principal   = "User:${data.confluent_service_account.user.id}"
  role_name   = "DeveloperRead"
  crn_pattern = "${data.confluent_schema_registry_cluster.schema_registry.resource_name}/subject=${each.value}-*"
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
