module "kafka_cluster" {
  source                     = "./../modules/kafka/confluent/cluster"
  cluster_name               = var.kafka_cluster_name
  region                     = "ap-southeast-2"
  admin_service_account_name = "${var.project_name}-admin"
  environment_name           = "${var.project_name}-${var.environment}"
  project_name               = var.project_name
  enable_prod_features       = false
}

resource "aws_ssm_parameter" "kafka_environment_id" {
  name  = "/${var.project_name}/kafka/${var.environment}/environment/id"
  type  = "SecureString"
  value = module.kafka_cluster.environment_id
}


resource "aws_ssm_parameter" "kafka_cluster_id" {
  name  = "/${var.project_name}/kafka/${var.environment}/cluster/id"
  type  = "SecureString"
  value = module.kafka_cluster.kafka_cluster.id
}
resource "aws_ssm_parameter" "kafka_cluster_endpoint" {
  name  = "/${var.project_name}/kafka/${var.environment}/cluster/endpoint"
  type  = "SecureString"
  value = module.kafka_cluster.kafka_cluster.bootstrap_endpoint
}

resource "aws_ssm_parameter" "kafka_rest_endpoint" {
  name  = "/${var.project_name}/kafka/${var.environment}/rest/endpoint"
  type  = "SecureString"
  value = module.kafka_cluster.kafka_cluster.rest_endpoint
}

resource "aws_ssm_parameter" "schema_registry_cluster_id" {
  name  = "/${var.project_name}/kafka/${var.environment}/schema_registry/cluster/id"
  type  = "SecureString"
  value = module.kafka_cluster.schema_registry.id
}

resource "aws_ssm_parameter" "schema_registry_rest_endpoint" {
  name  = "/${var.project_name}/kafka/${var.environment}/schema_registry/rest/endpoint"
  type  = "SecureString"
  value = module.kafka_cluster.schema_registry.rest_endpoint
}

resource "aws_ssm_parameter" "schema_registry_api_key_id" {
  name  = "/${var.project_name}/kafka/${var.environment}/schema_registry/api/key/id"
  type  = "SecureString"
  value = module.kafka_cluster.schema_manager_api_key_id
}

resource "aws_ssm_parameter" "schema_registry_api_key_secret" {
  name  = "/${var.project_name}/kafka/${var.environment}/schema_registry/api/key/secret"
  type  = "SecureString"
  value = module.kafka_cluster.schema_manager_api_key_secret
}

// store admin key id in SSM
resource "aws_ssm_parameter" "kafka_admin_key_id" {
  name  = "/${var.project_name}/kafka/${var.environment}/admin/key/id"
  type  = "SecureString"
  value = module.kafka_cluster.admin_api_key_id
}

//store admin key secret in SSM
resource "aws_ssm_parameter" "kafka_admin_key_secret" {
  name  = "/${var.project_name}/kafka/${var.environment}/admin/key/secret"
  type  = "SecureString"
  value = module.kafka_cluster.admin_api_key_secret
}
