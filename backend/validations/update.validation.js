const { z } = require('zod');

const createUpdateSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    image: z.string().url('Image must be a valid URL')
  })
});

module.exports = {
  createUpdateSchema
};
