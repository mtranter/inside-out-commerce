variable "project_name" {
  type = string
}

variable "environment_name" {
  type = string
}

variable "environment_id" {
  type        = string
  description = "Id of the environment"
}

variable "enable_prod_features" {
  type        = bool
  description = "Is this a production environment"
  default     = false
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
