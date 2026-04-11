const axios = require('axios');
const crypto = require('crypto');
const prisma = require('../config/db');
const { creditWallet } = require('./wallet.service');

const initializePayment = async (userId, email, amount, applicationId = null) => {
  try {
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amount * 100, // Paystack amount is in pesewas/kobo
        metadata: {
          userId,
          applicationId,
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const { authorization_url, reference } = response.data.data;

    // Create pending payment record
    await prisma.payment.create({
      data: {
        userId,
        amount,
        reference,
        status: 'pending',
        applicationId
      }
    });

    return { authorization_url, reference };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error initializing payment');
  }
};

const verifyWebhookSignature = (signature, requestBody) => {
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(requestBody)
    .digest('hex');
  
  return hash === signature;
};

const handleWebhook = async (signature, rawBody, body) => {
  if (!verifyWebhookSignature(signature, rawBody)) {
    throw new Error('Invalid signature');
  }

  const event = body.event;

  if (event === 'charge.success') {
    const data = body.data;
    const reference = data.reference;
    const metadata = data.metadata;
    const amountPaid = data.amount / 100;

    const payment = await prisma.payment.findUnique({ where: { reference } });

    // Handle idempotency: if already processed, simply return
    if (payment && payment.status === 'success') {
      return { success: true, message: 'Already processed' };
    }

    if (payment) {
      await prisma.payment.update({
        where: { reference },
        data: { status: 'success' }
      });
      
      // Finalize application metrics on payment
      if (metadata && metadata.applicationId) {
         try {
           const app = await prisma.application.findUnique({
             where: { id: metadata.applicationId },
             include: { plan: true }
           });

           if (app && app.plan) {
              let amountInvested = app.plan.price;
              let roiPercentage = app.plan.roiPercentage || 20;
              let expectedRoiAmount = (amountInvested * roiPercentage) / 100;

              await prisma.application.update({
                where: { id: metadata.applicationId },
                data: { 
                   paymentStatus: 'paid',
                   amountInvested,
                   expectedRoiAmount
                }
              });
           }
         } catch (e) {
           console.error("Error updating application upon payment:", e);
         }
      }

      // Credit wallet
      await creditWallet(payment.userId, amountPaid);
    }
  }

  return { success: true };
};

const getAllPayments = async () => {
  return await prisma.payment.findMany({
    include: {
      user: {
        select: {
          fullName: true,
          email: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

module.exports = {
  initializePayment,
  handleWebhook,
  getAllPayments
};
