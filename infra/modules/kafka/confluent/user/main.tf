data "confluent_kafka_cluster" "cluster" {
  id = var.cluster_id
  environment {
    id = var.environment_id
  }
}

resource "confluent_service_account" "this" {
  display_name = var.username
  description  = "Service account for the user '${var.username}'"
}

resource "confluent_api_key" "this" {
  display_name = "${var.username}-api-key"
  description  = "Kafka API Key that is owned by '${var.username}' service account"
  owner {
    id          = confluent_service_account.this.id
    api_version = confluent_service_account.this.api_version
    kind        = confluent_service_account.this.kind
  }

  managed_resource {
    id          = data.confluent_kafka_cluster.cluster.id
    api_version = data.confluent_kafka_cluster.cluster.api_version
    kind        = data.confluent_kafka_cluster.cluster.kind

    environment {
      id = var.environment_id
    }
  }
}
