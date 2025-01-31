const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { signupSchema } = require('./schema');
const { validateSchema } = require('../../middleware/validateSchema');

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

// Configuration
const USER_TABLE = process.env.USER_TABLE;
const PROFILE_IMAGES_BUCKET = process.env.PROFILE_IMAGES_BUCKET;
const SALT_ROUNDS = 10;

exports.handler = async (event) => {
  try {
    const validation = validateSchema(signupSchema)(event);
    if (!validation.isValid) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Validation failed',
          errors: validation.errors
        })
      };
    }

    const { email, password, name, profileImage } = validation.data;

    const existingUser = await dynamoDB.get({
      TableName: USER_TABLE,
      Key: { email }
    }).promise();

    if (existingUser.Item) {
      return {
        statusCode: 409,
        body: JSON.stringify({
          message: 'User already exists'
        })
      };
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    let profileImageUrl = null;
    if (profileImage) {
      const buffer = Buffer.from(profileImage.replace(/^data:image\/\w+;base64,/, ''), 'base64');
      const imageKey = `${uuidv4()}.jpg`;

      await s3.putObject({
        Bucket: PROFILE_IMAGES_BUCKET,
        Key: imageKey,
        Body: buffer,
        ContentType: 'image/jpeg',
        ACL: 'public-read'
      }).promise();

      profileImageUrl = `https://${PROFILE_IMAGES_BUCKET}.s3.amazonaws.com/${imageKey}`;
    }

    const user = {
      email,
      password: hashedPassword,
      name,
      profileImageUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await dynamoDB.put({
      TableName: USER_TABLE,
      Item: user,
      ConditionExpression: 'attribute_not_exists(email)'
    }).promise();

  
    const { password: _, ...userResponse } = user;
    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'User created successfully',
        user: userResponse
      })
    };

  } catch (error) {
    console.error('Error in signup:', error);

    if (error.code === 'ConditionalCheckFailedException') {
      return {
        statusCode: 409,
        body: JSON.stringify({
          message: 'User already exists'
        })
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal server error'
      })
    };
  }
};