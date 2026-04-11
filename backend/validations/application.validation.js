const { z } = require('zod');

const createApplicationSchema = z.object({
  body: z.object({
    planId: z.string().min(1, 'Plan ID is required')
  })
});

const updateApplicationStatusSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'approved', 'rejected'], 'Invalid status')
  })
});

module.exports = {
  createApplicationSchema,
  updateApplicationStatusSchema
};
