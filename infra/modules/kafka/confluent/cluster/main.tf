resource "confluent_environment" "env" {
  count        = var.create_environment ? 1 : 0
  display_name = var.environment_name
}

data "confluent_schema_registry_region" "essentials" {
  cloud   = var.cloud
  region  = var.region
  package = var.enable_prod_features ? "ADVANCED" : "ESSENTIALS"
}

data "confluent_environment" "env" {
  count        = var.create_environment ? 0 : 1
  display_name = var.environment_name
}

resource "confluent_kafka_cluster" "cluster" {
  display_name = var.cluster_name
  availability = var.enable_prod_features ? "MULTI_ZONE" : "SINGLE_ZONE"
  cloud        = var.cloud
  region       = var.region

  dynamic "basic" {
    for_each = var.enable_prod_features ? [] : [1]
    content {}
  }

  dynamic "standard" {
    for_each = var.enable_prod_features ? [1] : []
    content {}
  }

  environment {
    id = var.create_environment ? confluent_environment.env[0].id : data.confluent_environment.env[0].id
  }
}


resource "confluent_role_binding" "admin" {
  principal   = "User:${module.user.service_account.id}"
  role_name   = "CloudClusterAdmin"
  crn_pattern = confluent_kafka_cluster.cluster.rbac_crn
}

module "user" {
  source         = "./../user"
  username       = var.admin_service_account_name
  cluster_id     = confluent_kafka_cluster.cluster.id
  environment_id = var.create_environment ? confluent_environment.env[0].id : data.confluent_environment.env[0].id
}

module "schema_registry" {
  source         = "./../schema-registry"
  environment_id = var.create_environment ? confluent_environment.env[0].id : data.confluent_environment.env[0].id
  region         = var.region
  cloud          = var.cloud
  enable_prod_features        = var.enable_prod_features
}
