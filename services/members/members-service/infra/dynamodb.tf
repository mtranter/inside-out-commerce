module "dynamodb" {
  source = "github.com/mtranter/platform-in-a-box-aws//modules/terraform-aws-piab-dynamodb-table"
  name   = "InsideOutBank.MembersService"
  hash_key = {
    name = "hk"
    type = "S"
  }
  range_key = {
    name = "sk"
    type = "S"
  }
  point_in_time_recovery_enabled = true
  stream_enabled = true
}
