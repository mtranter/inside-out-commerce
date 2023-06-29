locals {
  topic_prefix  = "com.insideoutcommerce.products."
  topic_name    = "${local.topic_prefix}ProductData"
  api_subdomain = "products"
  execute_scope = "api.execute"
  stage_name    = "live"
}
