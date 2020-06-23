// Create clients and set shared const values outside of the handler.

// Create a DocumentClient that represents the query to add an item
const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

// Get the DynamoDB table name from environment variables
const tableName = process.env.SAMPLE_TABLE;

/**
 * A simple example includes a HTTP post method to add one item to a DynamoDB table.
 */
exports.putVinylHandler = async (event) => {
  if (event.httpMethod !== 'PUT') {
    throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
  }
  // All log statements are written to CloudWatch
  console.info('received:', event);

  // Get id and name from the body of the request
  const body = JSON.parse(event.body);
  const id = parseInt(event.pathParameters.id, 10);
  const name = body.name;
  const artist = body.artist;
  const album_title = body.album_title;
  const tracks =
    body.tracks.map((track, index) => {
      return { id: parseInt(Date.now() + index, 10), name: track.name };
    }) || [];

  const params = {
    TableName: tableName,
    Key: { id: id },
  };

  const foundItem = await docClient.get(params).promise();

  if (!Object.keys(foundItem).length) {
    return { statusCode: 400 };
  }

  const result = await docClient
    .put({ TableName: tableName, Item: { id: foundItem.Item.id, name: name, artist, album_title, tracks } })
    .promise();

  const response = {
    statusCode: 200,
    body: JSON.stringify(body),
  };

  // All log statements are written to CloudWatch
  console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
  return response;
};
