variable "api_name" {
  type = string
}

variable "function_name" {
  type = string
}

variable "function_qualifier" {
  type    = string
  default = null
}

variable "parent_resource_id" {
  type    = string
  default = null
}

variable "deployment_triggers" {
  type    = list(any)
  default = []
}

variable "oauth_scopes" {
  type    = list(string)
  default = []
}

variable "authorizer" {
  type = object({
    type = string
    authorizaer_id = optional(string) 
    oauth_scopes = optional(list(string))
  })
}
