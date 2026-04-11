const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ConditionalCheckFailedException') {
    return res.status(400).json({ error: 'User already exists' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
};

module.exports = errorHandler;
