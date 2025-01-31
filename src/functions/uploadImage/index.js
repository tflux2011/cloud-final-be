// src/functions/uploadImage/index.js
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const { verifyToken } = require('../../middleware/auth');

const s3 = new AWS.S3();
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const PROFILE_IMAGES_BUCKET = process.env.PROFILE_IMAGES_BUCKET;
const USER_TABLE = process.env.USER_TABLE;

exports.handler = async (event) => {
  try {
    // Verify authentication
    const auth = await verifyToken(event);
    if (!auth.isValid) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          message: 'Unauthorized'
        })
      };
    }

    const { email } = auth.user;
    const { image } = JSON.parse(event.body);

    if (!image) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Image data is required'
        })
      };
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ''),
      'base64'
    );

    // Generate unique filename
    const imageKey = `${uuidv4()}.jpg`;

    // Upload to S3
    await s3.putObject({
      Bucket: PROFILE_IMAGES_BUCKET,
      Key: imageKey,
      Body: buffer,
      ContentType: 'image/jpeg',
      ACL: 'public-read'
    }).promise();

    const imageUrl = `https://${PROFILE_IMAGES_BUCKET}.s3.amazonaws.com/${imageKey}`;

    // Update user profile in DynamoDB
    await dynamoDB.update({
      TableName: USER_TABLE,
      Key: { email },
      UpdateExpression: 'SET profileImageUrl = :imageUrl, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':imageUrl': imageUrl,
        ':updatedAt': new Date().toISOString()
      }
    }).promise();

    // Get updated user data
    const result = await dynamoDB.get({
      TableName: USER_TABLE,
      Key: { email }
    }).promise();

    const { password: _, ...userResponse } = result.Item;

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Profile image updated successfully',
        user: userResponse
      })
    };

  } catch (error) {
    console.error('Error in image upload:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal server error'
      })
    };
  }
};