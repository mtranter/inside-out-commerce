variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "kafka_cluster_name" {
  type        = string
  description = "Name of the Kafka cluster"
}

variable "enable_prod_features" {
  type = bool
}