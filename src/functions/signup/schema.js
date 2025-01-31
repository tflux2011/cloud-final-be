const signupSchema = {
    type: 'object',
    required: ['email', 'password', 'name'],
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
        maxLength: 100,
        pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
      },
      name: {
        type: 'string',
        minLength: 2,
        maxLength: 100
      },
      profileImage: {
        type: 'string',
        pattern: '^data:image\\/[a-zA-Z]*;base64,',
        optional: true
      }
    },
    additionalProperties: false
  };
  
  module.exports = { signupSchema };