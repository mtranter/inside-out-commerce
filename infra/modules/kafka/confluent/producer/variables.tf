
variable "user_id" {
  type = string
}

variable "environment_id" {
  type        = string
  description = "Id of the environment"
}

variable "schema_registry_cluster_id" {
  type        = string
  description = "Resource name of the schema registry"
}

variable "cluster_id" {
  type        = string
  description = "Id of the cluster"
}

variable "topic_prefix" {
  type = string
}
