locals {
  topic_prefix  = "com.insideoutbank.members."
  topic_name    = "${local.topic_prefix}MemberData"
  api_subdomain = "members"
  execute_scope = "api.execute"
  stage_name    = "live"
}
