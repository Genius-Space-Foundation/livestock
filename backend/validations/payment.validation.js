const { z } = require('zod');

const initializePaymentSchema = z.object({
  body: z.object({
    amount: z.number().min(1, 'Amount must be greater than zero'),
    applicationId: z.string().optional()
  })
});

module.exports = {
  initializePaymentSchema
};
