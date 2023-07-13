locals {
  topic_prefix  = "com.insideoutcommerce.catalog."
  topic_name    = "${local.topic_prefix}ProductData"
  api_subdomain = "catalog"
  execute_scope = "api.execute"
  stage_name    = "live"
  lambda_env_vars = {
    API_STAGE                      = local.stage_name
    TABLE_NAME                     = module.dynamodb.table.id
    EVENTS_TOPIC                   = local.topic_name
    KEY_SCHEMA_ID                  = module.events_topic.key_schema_id
    VALUE_SCHEMA_ID                = module.events_topic.value_schema_id
    SCHEMA_REGISTRY_HOST           = data.aws_ssm_parameter.schema_registry_endpoint.value
    SCHEMA_REGISTRY_USERNAME       = data.aws_ssm_parameter.schema_registry_username.value
    SCHEMA_REGISTRY_PASSWORD       = data.aws_ssm_parameter.schema_registry_password.value
    ID_TOKEN_ENDPOINT              = "https://${var.project_name}-${var.environment}.auth.${data.aws_region.current.name}.amazoncognito.com/oauth2/token"
    BATCH_CREATE_PRODUCT_QUEUE_URL = aws_sqs_queue.batch_create_queue.id

  }
}
