variable "resource_type" {
  type        = string
  description = "Resource type"
  validation {
    condition     = contains(["TOPIC", "GROUP", "CLUSTER", "TRANSACTIONAL_ID", "DELEGATION_TOKEN"], var.resource_type)
    error_message = "Resource type must be TOPIC, GROUP, CLUSTER, TRANSACTIONAL_ID or DELEGATION_TOKEN."
  }
}

variable "resource_name" {
  type        = string
  description = "Resource name"
}

variable "resource_name_is_prefix" {
  type        = bool
  description = "Resource name is a prefix"
  default     = false
}

variable "user_id" {
  type        = string
  description = "User ID"
}


variable "host" {
  type        = string
  description = "Host"
  default     = "*"
}

variable "operation" {
  type        = string
  description = "Operation"
  validation {
    condition     = contains(["ALL", "READ", "WRITE", "CREATE", "DELETE", "ALTER", "DESCRIBE", "CLUSTER_ACTION", "DESCRIBE_CONFIGS", "ALTER_CONFIGS", "IDEMPOTENT_WRITE"], var.operation)
    error_message = "Operation must be ALL, READ, WRITE, CREATE, DELETE, ALTER, DESCRIBE, CLUSTER_ACTION, DESCRIBE_CONFIGS, ALTER_CONFIGS or IDEMPOTENT_WRITE."
  }
}


variable "permission" {
  type        = string
  description = "Permission"
  validation {
    condition     = contains(["ALLOW", "DENY"], var.permission)
    error_message = "Permission must be ALLOW or DENY."
  }
  default = "ALLOW"
}
