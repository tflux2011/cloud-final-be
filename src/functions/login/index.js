const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { loginSchema } = require('./schema');
const { validateSchema } = require('../../middleware/validateSchema');

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const USER_TABLE = process.env.USER_TABLE;
const JWT_SECRET = process.env.JWT_SECRET;

exports.handler = async (event) => {
  try {
    const validation = validateSchema(loginSchema)(event);
    if (!validation.isValid) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Validation failed',
          errors: validation.errors
        })
      };
    }

    const { email, password } = validation.data;

    const result = await dynamoDB.get({
      TableName: USER_TABLE,
      Key: { email }
    }).promise();

    const user = result.Item;

    if (!user) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          message: 'Invalid credentials'
        })
      };
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          message: 'Invalid credentials'
        })
      };
    }

    const token = jwt.sign(
      {
        email: user.email,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password: _, ...userResponse } = user;
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Login successful',
        user: userResponse,
        token
      })
    };

  } catch (error) {
    console.error('Error in login:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal server error'
      })
    };
  }
};