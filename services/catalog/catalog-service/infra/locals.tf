locals {
  topic_prefix  = "com.insideoutcommerce.catalog."
  topic_name    = "${local.topic_prefix}ProductData"
  api_subdomain = "catalog"
  execute_scope = "api.execute"
  stage_name    = "live"
}
