
// topic name variable
variable "topic_name" {
  type        = string
  description = "Name of the topic"
}

//partitions variable
variable "partitions" {
  type        = number
  description = "Number of partitions"
}

//replication_factor variable
variable "replication_factor" {
  type        = number
  description = "Replication factor"
}

variable "is_compact" {
  type        = bool
  description = "Is this a compact topic"
  default     = true
}

// topic config struct variable
variable "config" {
  type        = map(string)
  description = "Topic config"
  default     = {}
}


variable "key_schema" {
  type        = string
  description = "Key schema"
}

variable "value_schema" {
  type        = string
  description = "Value schema"
}

variable "key_schema_compatability" {
  type        = string
  description = "Key schema compatability"
  default     = "FULL_TRANSITIVE"
  validation {
    condition = can(regex("^(BACKWARD|BACKWARD_TRANSITIVE|FORWARD|FORWARD_TRANSITIVE|FULL|FULL_TRANSITIVE|NONE)$", var.key_schema_compatability))
    error_message = "Invalid key schema compatability."
  }
}

variable "value_schema_compatability" {
  type        = string
  description = "Value schema compatability"
  default     = "FULL_TRANSITIVE"
  validation {
    condition = can(regex("^(BACKWARD|BACKWARD_TRANSITIVE|FORWARD|FORWARD_TRANSITIVE|FULL|FULL_TRANSITIVE|NONE)$", var.value_schema_compatability))
    error_message = "Invalid value schema compatability."
  }
}
