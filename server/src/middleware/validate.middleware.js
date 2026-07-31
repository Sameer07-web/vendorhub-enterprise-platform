const ApiError = require("../utils/ApiError");

const validate = (schema) => (req, res, next) => {
  // Support both direct Joi objects and objects wrapping { body, query, params }
  const parts = ['body', 'query', 'params'];
  for (const part of parts) {
    if (schema[part]) {
      const { error, value } = schema[part].validate(req[part], { abortEarly: false, stripUnknown: true });
      if (error) {
        const errorMessage = error.details.map((details) => details.message).join(", ");
        return next(new ApiError(400, errorMessage));
      }
      req[part] = value;
    }
  }

  // Handle direct Joi schema (usually matching req.body)
  if (typeof schema.validate === 'function' && !schema.body && !schema.query && !schema.params) {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      const errorMessage = error.details.map((details) => details.message).join(", ");
      return next(new ApiError(400, errorMessage));
    }
    req.body = value;
  }
  
  next();
};

module.exports = validate;
