variable "project_name" {
  type = string
}

variable "environment_name" {
  type        = string
  description = "Name of the environment"
}

variable "enable_prod_features" {
  type        = bool
  description = "Enable production features"
  default     = false
}

variable "create_environment" {
  type        = bool
  description = "Create a new environment"
  default     = true
}

variable "cluster_name" {
  type        = string
  description = "Name of the cluster"
}


variable "cloud" {
  type        = string
  default     = "AWS"
  description = "Cloud provider, AWS or GCP or Azure"
  validation {
    condition     = contains(["AWS", "GCP", "AZURE"], var.cloud)
    error_message = "Cloud provider must be AWS, GCP or Azure."
  }
}

variable "region" {
  type        = string
  description = "Region to deploy the cluster"
}

variable "admin_service_account_name" {
  type        = string
  description = "Name of the admin service account"
}
