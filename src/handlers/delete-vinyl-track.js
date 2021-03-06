// Create clients and set shared const values outside of the handler.

// Create a DocumentClient that represents the query to add an item
const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

// Get the DynamoDB table name from environment variables
const tableName = process.env.SAMPLE_TABLE;

/**
 * A simple example includes a HTTP post method to add one item to a DynamoDB table.
 */
exports.deleteVinylTrackHandler = async (event) => {
  if (event.httpMethod !== 'DELETE') {
    throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
  }
  // All log statements are written to CloudWatch
  console.info('received:', event);

  const id = parseInt(event.pathParameters.id, 10);
  const trackId = parseInt(event.pathParameters.trackId, 10);

  const params = {
    TableName: tableName,
    Key: { id: id },
  };

  const foundItem = await docClient.get(params).promise();

  if (!Object.keys(foundItem).length) {
    return { statusCode: 400 };
  }
  const foundTrack = foundItem.Item.tracks.find((track) => track.id === trackId);
  if (!foundTrack) {
    return { statusCode: 400 };
  }

  const foundVinyl = { ...foundItem.Item, tracks: foundItem.Item.tracks.filter((track) => track.id !== trackId) };
  console.log('siema', foundVinyl);
  const result = await docClient.put({ TableName: tableName, Item: foundVinyl }).promise();

  const response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://master.d25yppnk4ptyau.amplifyapp.com',
      'Content-Type': 'application/json',
    },
  };

  // All log statements are written to CloudWatch
  console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
  return response;
};
