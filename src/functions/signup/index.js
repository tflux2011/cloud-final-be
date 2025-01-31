// src/functions/signup/index.js
const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { validateEmail, validatePassword } = require('../../utils/validation');

// Initialize DynamoDB client
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

// Configuration
const USER_TABLE = process.env.USER_TABLE;
const PROFILE_IMAGES_BUCKET = process.env.PROFILE_IMAGES_BUCKET;
const SALT_ROUNDS = 10;

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { email, password, name, profileImage } = body;

    // Validate input
    if (!email || !password || !name) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Missing required fields: email, password, and name are required'
        })
      };
    }

    // Validate email format
    if (!validateEmail(email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Invalid email format'
        })
      };
    }

    // Validate password strength
    if (!validatePassword(password)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        })
      };
    }

    // Check if user already exists
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Handle profile image upload if provided
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

    // Create user record
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

    // Return success response (excluding password)
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