const axios = require('axios');
const crypto = require('crypto');
const prisma = require('../config/db');
const { creditWallet } = require('./wallet.service');

const initializePayment = async (userId, email, amount, applicationId = null, callback_url = null) => {
  try {
    const payload = {
      email,
      amount: amount * 100, // Paystack amount is in pesewas/kobo
      metadata: {
        userId,
        applicationId,
      }
    };

    if (callback_url) {
      payload.callback_url = callback_url;
    }

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      payload,
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
    console.error('Error initializing payment:', error.response?.data || error.message);
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

const processSuccessfulPayment = async (reference, amountPaid, metadata) => {
  const payment = await prisma.payment.findUnique({ where: { reference } });

  if (!payment) {
    console.warn(`Payment record not found for reference: ${reference}`);
    return { success: false, message: 'Payment record not found' };
  }

  // Handle idempotency: if already processed, simply return
  if (payment.status === 'success') {
    console.log(`Payment ${reference} already marked as success.`);
    return { success: true, message: 'Already processed' };
  }

  await prisma.payment.update({
    where: { reference },
    data: { status: 'success' }
  });
  
  // Finalize application metrics on payment
  if (metadata && metadata.applicationId) {
     console.log(`Finalizing application ${metadata.applicationId} metrics...`);
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
          console.log(`Application ${metadata.applicationId} updated to paid.`);
       }
     } catch (e) {
       console.error("Error updating application upon payment:", e);
     }
  } else {
    // It's a wallet deposit
    console.log(`Crediting wallet for user ${payment.userId} with ${amountPaid}...`);
    await creditWallet(payment.userId, amountPaid);
    console.log(`Wallet credited successfully.`);
  }

  return { success: true };
};

const handleWebhook = async (signature, rawBody, body) => {
  if (!verifyWebhookSignature(signature, rawBody)) {
    console.error('Paystack Webhook: Invalid Signature');
    throw new Error('Invalid signature');
  }

  const event = body.event;
  console.log(`Paystack Webhook Received: ${event}`);

  if (event === 'charge.success') {
    const data = body.data;
    const reference = data.reference;
    // Paystack might send metadata as string or object
    const metadata = typeof data.metadata === 'string' ? JSON.parse(data.metadata) : data.metadata;
    const amountPaid = data.amount / 100;

    console.log(`Processing successful charge via Webhook. Ref: ${reference}, Amount: ${amountPaid}`);
    return await processSuccessfulPayment(reference, amountPaid, metadata);
  }

  return { success: true };
};

const verifyPaymentStatus = async (reference) => {
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const { status, data } = response.data;

    if (status && data.status === 'success') {
      const amountPaid = data.amount / 100;
      const metadata = typeof data.metadata === 'string' ? JSON.parse(data.metadata) : data.metadata;
      
      console.log(`Manually verifying payment status for ${reference}: SUCCESS`);
      return await processSuccessfulPayment(reference, amountPaid, metadata);
    } else {
      console.log(`Manually verifying payment status for ${reference}: ${data.status}`);
      return { success: false, message: `Payment status is ${data.status}` };
    }
  } catch (error) {
    console.error('Error verifying payment status:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error verifying payment status');
  }
};

const getUserPayments = async (userId) => {
  return await prisma.payment.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
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

const getPlatformActivity = async () => {
  const [payments, withdrawals] = await Promise.all([
    prisma.payment.findMany({
      where: { status: 'success' },
      include: { user: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
      take: 15
    }),
    prisma.withdrawal.findMany({
      where: { status: { in: ['pending', 'approved'] } },
      include: { user: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
      take: 15
    })
  ]);

  const anonymize = (name) => {
    if (!name) return 'User';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1][0]}.`;
  };

  const formattedPayments = payments.map(p => ({
    id: p.id,
    type: 'deposit',
    userName: anonymize(p.user?.fullName),
    amount: p.amount,
    createdAt: p.createdAt
  }));

  const formattedWithdrawals = withdrawals.map(w => ({
    id: w.id,
    type: 'withdrawal',
    userName: anonymize(w.user?.fullName),
    amount: w.amount,
    createdAt: w.createdAt
  }));

  const mockActivities = [
    { id: 'm1', type: 'deposit', userName: 'Kofi A.', amount: 1500, createdAt: new Date(Date.now() - 1000 * 60 * 5) },
    { id: 'm2', type: 'deposit', userName: 'Sarah M.', amount: 500, createdAt: new Date(Date.now() - 1000 * 60 * 15) },
    { id: 'm3', type: 'withdrawal', userName: 'Ibrahim O.', amount: 200, createdAt: new Date(Date.now() - 1000 * 60 * 45) },
    { id: 'm4', type: 'deposit', userName: 'Ama R.', amount: 3000, createdAt: new Date(Date.now() - 1000 * 60 * 120) },
    { id: 'm5', type: 'withdrawal', userName: 'Kwesi B.', amount: 150, createdAt: new Date(Date.now() - 1000 * 60 * 180) },
    { id: 'm6', type: 'deposit', userName: 'Janet T.', amount: 800, createdAt: new Date(Date.now() - 1000 * 60 * 240) },
    { id: 'm7', type: 'deposit', userName: 'Musa S.', amount: 1200, createdAt: new Date(Date.now() - 1000 * 60 * 300) },
  ];

  return [...formattedPayments, ...formattedWithdrawals, ...mockActivities]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 20);
};

module.exports = {
  initializePayment,
  handleWebhook,
  verifyPaymentStatus,
  getUserPayments,
  getAllPayments,
  getPlatformActivity
};
