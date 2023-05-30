
data "confluent_schema_registry_region" "this" {
  cloud   = var.cloud
  region  = var.region
  package = var.enable_prod_features ? "ADVANCED" : "ESSENTIALS"
}

data "confluent_environment" "this" {
  id = var.environment_id
}

resource "confluent_schema_registry_cluster" "essentials" {
  package = data.confluent_schema_registry_region.this.package

  environment {
    id = var.environment_id
  }

  region {
    # See https://docs.confluent.io/cloud/current/stream-governance/packages.html#stream-governance-regions
    # Schema Registry and Kafka clusters can be in different regions as well as different cloud providers,
    # but you should to place both in the same cloud and region to restrict the fault isolation boundary.
    id = data.confluent_schema_registry_region.this.id
  }
}


resource "confluent_service_account" "schema_manager" {
  display_name = "${var.project_name}-${var.environment_name}-schema-manager"
  description  = "Service account to manage schema"
}

resource "confluent_role_binding" "schema_manager_environment_admin" {
  principal   = "User:${confluent_service_account.schema_manager.id}"
  role_name   = "EnvironmentAdmin"
  crn_pattern = data.confluent_environment.this.resource_name
}

resource "confluent_api_key" "schema_manager_api_key" {
  display_name = "${var.project_name}-${var.environment_name}-schema-manager-schema-registry-api-key"
  description  = "Schema Registry API Key that is owned by 'schema-manager' service account"
  owner {
    id          = confluent_service_account.schema_manager.id
    api_version = confluent_service_account.schema_manager.api_version
    kind        = confluent_service_account.schema_manager.kind
  }

  managed_resource {
    id          = confluent_schema_registry_cluster.essentials.id
    api_version = confluent_schema_registry_cluster.essentials.api_version
    kind        = confluent_schema_registry_cluster.essentials.kind

    environment {
      id = var.environment_id
    }
  }

  depends_on = [
    confluent_role_binding.schema_manager_environment_admin
  ]
}
