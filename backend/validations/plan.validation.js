const { z } = require('zod');

const planSchema = z.object({
  body: z.object({
    type: z.enum(['Poultry', 'Goat', 'Cattle', 'Pig'], 'Invalid plan type'),
    description: z.string().min(1, 'Description is required'),
    duration: z.string().min(1, 'Duration is required'),
    price: z.number().min(0, 'Price must be a positive number'),
    roiPercentage: z.number().min(0).optional(),
    status: z.enum(['active', 'inactive']).optional()
  })
});

const updatePlanSchema = z.object({
  body: z.object({
    type: z.enum(['Poultry', 'Goat', 'Cattle', 'Pig']).optional(),
    description: z.string().optional(),
    duration: z.string().optional(),
    price: z.number().min(0).optional(),
    roiPercentage: z.number().min(0).optional(),
    status: z.enum(['active', 'inactive']).optional()
  })
});

module.exports = {
  planSchema,
  updatePlanSchema
};
