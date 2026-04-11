const { z } = require('zod');

const requestWithdrawalSchema = z.object({
  body: z.object({
    amount: z.number().min(1, 'Amount must be greater than zero'),
    phoneNumber: z.string().min(10, 'Phone number must be at least 10 characters'),
    network: z.enum(['MTN', 'Vodafone', 'AirtelTigo'], 'Invalid network')
  })
});

module.exports = {
  requestWithdrawalSchema
};
