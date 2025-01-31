const uploadImageSchema = {
    type: 'object',
    required: ['image'],
    properties: {
      image: {
        type: 'string',
        pattern: '^data:image\\/[a-zA-Z]*;base64,',
        minLength: 1,
        maxLength: 5242880 // 5MB in base64
      }
    },
    additionalProperties: false
  };
  
  module.exports = { uploadImageSchema };