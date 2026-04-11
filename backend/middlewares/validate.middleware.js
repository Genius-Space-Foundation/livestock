const validate = (schema) => (req, res, next) => {
  try {
    // Parse request body and query using Zod
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (err) {
    // Pass ZodError to the global error handler
    next(err);
  }
};

module.exports = { validate };
