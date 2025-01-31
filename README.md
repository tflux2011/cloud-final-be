# CS 516 - Final Project

This final project was built with Node.js, AWS Lambda, DynamoDB, and S3 for handling user registration, authentication, and profile image management.

## Features

- User registration with email and password
- Secure password hashing
- JWT-based authentication
- Profile image upload and management
- Serverless architecture using AWS services
- Input validation and error handling
- CORS support

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or later)
- npm (v8 or later)
- AWS CLI (configured with appropriate credentials)
- Serverless Framework CLI

To install the Serverless Framework CLI globally:

```bash
npm install -g serverless
```

## Setup Instructions

### Clone the repository

```bash
git clone <repository-url>
cd serverless-auth
```

### Install dependencies

```bash
npm install
```

### Configure AWS credentials

```bash
aws configure
```

Enter your AWS access key ID, secret access key, and preferred region when prompted.

### Set up environment variables

Create a `.env` file in the root directory with the following content:

```bash
USER_TABLE=serverless-auth-dev-users
PROFILE_IMAGES_BUCKET=serverless-auth-dev-images
JWT_SECRET=your-secure-jwt-secret
```

### Deploy the application

```bash
npm run deploy
```

## Local Development

### Install local development dependencies

```bash
npm install -D serverless-offline serverless-dynamodb-local serverless-s3-local
```

### Start the local server

```bash
serverless offline start
```

## Testing

### Run the test suite

```bash
npm test
```

### Run tests with coverage

```bash
npm test -- --coverage
```

## API Documentation

### Sign Up

```bash
POST /signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "profileImage": "base64-encoded-image" // optional
}
```

### Login

```bash
POST /login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

### Upload Profile Image

```bash
POST /upload-image
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "image": "base64-encoded-image"
}
```

## Project Structure

```plaintext
serverless-auth/
├── src/
│   ├── functions/        # Lambda function handlers
│   ├── middleware/       # Shared middleware
│   ├── utils/           # Helper functions
│   └── config/          # Configuration files
├── tests/               # Test files
└── resources/           # AWS resource definitions
```

## Error Handling

The API returns standard HTTP status codes with descriptive messages:

- 200: Success
- 201: Resource created
- 400: Bad request
- 401: Unauthorized
- 409: Conflict (e.g., user already exists)
- 500: Internal server error

## Security Measures

- Passwords are hashed using bcrypt
- JWT tokens expire after 24 hours
- S3 bucket is configured with proper CORS settings
- Input validation for all endpoints
- Rate limiting on authentication endpoints
- Secure environment variable management

## Deployment

### Development Environment

```bash
serverless deploy --stage dev
```

### Production Environment

```bash
serverless deploy --stage prod
```

### Single Function Deployment

```bash
serverless deploy function -f functionName
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Troubleshooting Guide

### Deployment Failures

- Verify AWS credentials are correctly configured
- Check CloudWatch logs for detailed error messages
- Ensure all required environment variables are set

### Local Development Issues

- Confirm all dependencies are installed
- Check port conflicts
- Verify local AWS credentials

### Image Upload Issues

- Verify S3 bucket permissions
- Check image size and format
- Ensure proper base64 encoding

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the repository or contact the maintainers.
