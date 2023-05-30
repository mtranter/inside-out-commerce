
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
