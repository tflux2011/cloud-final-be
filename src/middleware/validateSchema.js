const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true, format: 'full' });

const validateSchema = (schema) => {
  const validate = ajv.compile(schema);
  
  return (event) => {
    const body = JSON.parse(event.body);
    const valid = validate(body);
    
    if (!valid) {
      const errors = validate.errors.map(error => ({
        field: error.instancePath.slice(1),
        message: error.message
      }));
      
      return {
        isValid: false,
        errors
      };
    }
    
    return {
      isValid: true,
      data: body
    };
  };
};

module.exports = { validateSchema };