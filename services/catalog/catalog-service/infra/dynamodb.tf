module "dynamodb" {
  source = "github.com/mtranter/platform-in-a-box-aws//modules/terraform-aws-piab-dynamodb-table"
  name   = "${var.project_name}-${var.service_name}-${var.environment}"
  hash_key = {
    name = "hk"
    type = "S"
  }
  range_key = {
    name = "sk"
    type = "S"
  }
  global_secondary_indexes = [{
    name = "gsi1"
    hash_key = {
      name = "category"
      type = "S"
    }
    range_key = {
      name = "hk"
      type = "S"
    }
    }, {
    name = "gsi2"
    hash_key = {
      name = "subcategory"
      type = "S"
    }
    range_key = {
      name = "hk"
      type = "S"
    }

    }, {
    name = "gsi3"
    hash_key = {
      name = "sk"
      type = "S"
    }
    range_key = {
      name = "hk"
      type = "S"
    }

    }]
  point_in_time_recovery_enabled = true
  stream_enabled                 = true
}

// data block, policy to allow lambda to read from dynamodb
data "aws_iam_policy_document" "allow_dynamodb" {
  statement {
    actions = [
      "dynamodb:*"
    ]
    resources = [
      module.dynamodb.table.arn,
      "${module.dynamodb.table.arn}/*"
    ]
  }
}

resource "aws_iam_policy" "allow_dynamodb" {
  name   = "${var.project_name}-${var.environment}-${var.service_name}-${module.dynamodb.table.id}-read-write"
  policy = data.aws_iam_policy_document.allow_dynamodb.json
}
