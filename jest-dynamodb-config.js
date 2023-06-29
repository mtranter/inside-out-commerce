/**
 * @type {import('@aws-sdk/client-dynamodb').DynamoDBClientConfig}
 */
const config = {
  tables: [],
  port: 9011,
  options: ["-sharedDb"],
};

module.exports = config;
