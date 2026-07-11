const ApiError = require("../utils/ApiError");

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  
  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(", ");
    return next(new ApiError(400, errorMessage));
  }
  
  req.body = value;
  next();
};

module.exports = validate;
