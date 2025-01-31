const loginSchema = {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: {
        type: 'string',
        format: 'email',
        minLength: 5,
        maxLength: 255
      },
      password: {
        type: 'string',
        minLength: 8,
        maxLength: 100
      }
    },
    additionalProperties: false
  };
  
  module.exports = { loginSchema };