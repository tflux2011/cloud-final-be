// src/functions/login/index.js
const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const USER_TABLE = process.env.USER_TABLE;
const JWT_SECRET = process.env.JWT_SECRET;

exports.handler = async (event) => {
  try {
    const { email, password } = JSON.parse(event.body);

    // Validate input
    if (!email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Email and password are required'
        })
      };
    }

    // Get user from database
    const result = await dynamoDB.get({
      TableName: USER_TABLE,
      Key: { email }
    }).promise();

    const user = result.Item;

    // Check if user exists
    if (!user) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          message: 'Invalid credentials'
        })
      };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          message: 'Invalid credentials'
        })
      };
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        email: user.email,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data and token (excluding password)
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