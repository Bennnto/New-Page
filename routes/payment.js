const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Payment = require('../models/Payment');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createPaymentValidation = [
  body('amount')
    .isInt({ min: 50 }) // Minimum $0.50
    .withMessage('Amount must be at least 50 cents'),
  body('currency')
    .optional()
    .isIn(['usd', 'eur', 'gbp'])
    .withMessage('Currency must be USD, EUR, or GBP'),
  body('plan')
    .isIn(['basic', 'premium', 'enterprise'])
    .withMessage('Invalid subscription plan'),
  body('billingCycle')
    .isIn(['monthly', 'yearly'])
    .withMessage('Billing cycle must be monthly or yearly')
];

// @route   POST /api/payment/create-payment-intent
// @desc    Create a payment intent for subscription
// @access  Private
router.post('/create-payment-intent', authenticate, createPaymentValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { amount, currency = 'usd', plan, billingCycle } = req.body;
    const user = req.user;
    
    // Get or create Stripe customer
    let stripeCustomerId = user.subscription.stripeCustomerId;
    
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.fullName,
        metadata: {
          userId: user._id.toString(),
          plan: plan,
          billingCycle: billingCycle
        }
      });
      
      stripeCustomerId = customer.id;
      
      // Update user with Stripe customer ID
      await User.findByIdAndUpdate(user._id, {
        'subscription.stripeCustomerId': stripeCustomerId
      });
    }
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency.toLowerCase(),
      customer: stripeCustomerId,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: user._id.toString(),
        plan: plan,
        billingCycle: billingCycle,
        type: 'subscription'
      },
      description: `${plan} plan - ${billingCycle} billing`
    });
    
    // Save payment record
    const payment = new Payment({
      user: user._id,
      stripePaymentIntentId: paymentIntent.id,
      stripeCustomerId: stripeCustomerId,
      amount: amount,
      currency: currency.toUpperCase(),
      status: 'pending',
      paymentMethod: 'card',
      description: `${plan} plan - ${billingCycle} billing`,
      metadata: {
        plan: plan,
        billingCycle: billingCycle
      }
    });
    
    await payment.save();
    
    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: amount,
        currency: currency,
        plan: plan,
        billingCycle: billingCycle
      }
    });
    
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/payment/create-subscription
// @desc    Create a recurring subscription
// @access  Private
router.post('/create-subscription', authenticate, async (req, res) => {
  try {
    const { priceId, paymentMethodId } = req.body;
    const user = req.user;
    
    if (!priceId || !paymentMethodId) {
      return res.status(400).json({
        success: false,
        message: 'Price ID and Payment Method ID are required'
      });
    }
    
    // Get or create Stripe customer
    let stripeCustomerId = user.subscription.stripeCustomerId;
    
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.fullName,
        payment_method: paymentMethodId,
        metadata: {
          userId: user._id.toString()
        }
      });
      
      stripeCustomerId = customer.id;
      
      // Update user with Stripe customer ID
      await User.findByIdAndUpdate(user._id, {
        'subscription.stripeCustomerId': stripeCustomerId
      });
    }
    
    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeCustomerId,
    });
    
    // Update customer's default payment method
    await stripe.customers.update(stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
    
    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: priceId }],
      default_payment_method: paymentMethodId,
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId: user._id.toString()
      }
    });
    
    res.json({
      success: true,
      data: {
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
        status: subscription.status
      }
    });
    
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subscription',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/payment/webhook
// @desc    Handle Stripe webhooks
// @access  Public (but verified)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  try {
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handling error:', error);
    res.status(500).json({ error: 'Webhook handling failed' });
  }
});

// Helper functions for webhook handling
async function handlePaymentSucceeded(paymentIntent) {
  const payment = await Payment.findOne({
    stripePaymentIntentId: paymentIntent.id
  });
  
  if (payment) {
    await payment.updateStatus('succeeded');
    
    // Update user subscription if this is a subscription payment
    if (payment.metadata.plan) {
      const user = await User.findById(payment.user);
      if (user) {
        user.subscription.status = 'active';
        user.subscription.plan = payment.metadata.plan;
        user.subscription.currentPeriodEnd = new Date(Date.now() + (
          payment.metadata.billingCycle === 'yearly' ? 365 : 30
        ) * 24 * 60 * 60 * 1000);
        
        await user.save();
      }
    }
  }
}

async function handlePaymentFailed(paymentIntent) {
  const payment = await Payment.findOne({
    stripePaymentIntentId: paymentIntent.id
  });
  
  if (payment) {
    await payment.updateStatus('failed', paymentIntent.last_payment_error?.message);
  }
}

async function handleSubscriptionCreated(subscription) {
  const userId = subscription.metadata.userId;
  
  if (userId) {
    const user = await User.findById(userId);
    if (user) {
      user.subscription.stripeSubscriptionId = subscription.id;
      user.subscription.status = subscription.status === 'active' ? 'active' : 'inactive';
      user.subscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
      
      await user.save();
    }
  }
}

async function handleSubscriptionUpdated(subscription) {
  const userId = subscription.metadata.userId;
  
  if (userId) {
    const user = await User.findById(userId);
    if (user) {
      user.subscription.status = subscription.status === 'active' ? 'active' : 'inactive';
      user.subscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
      user.subscription.cancelAtPeriodEnd = subscription.cancel_at_period_end;
      
      await user.save();
    }
  }
}

async function handleSubscriptionDeleted(subscription) {
  const userId = subscription.metadata.userId;
  
  if (userId) {
    const user = await User.findById(userId);
    if (user) {
      user.subscription.status = 'cancelled';
      user.subscription.plan = 'free';
      user.subscription.stripeSubscriptionId = null;
      user.subscription.currentPeriodEnd = null;
      user.subscription.cancelAtPeriodEnd = false;
      
      await user.save();
    }
  }
}

async function handleInvoicePaymentSucceeded(invoice) {
  // Handle successful recurring payment
  const customerId = invoice.customer;
  
  const user = await User.findOne({
    'subscription.stripeCustomerId': customerId
  });
  
  if (user && invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    
    user.subscription.status = 'active';
    user.subscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    
    await user.save();
  }
}

async function handleInvoicePaymentFailed(invoice) {
  // Handle failed recurring payment
  const customerId = invoice.customer;
  
  const user = await User.findOne({
    'subscription.stripeCustomerId': customerId
  });
  
  if (user) {
    user.subscription.status = 'past_due';
    await user.save();
  }
}

// @route   GET /api/payment/history
// @desc    Get user's payment history
// @access  Private
router.get('/history', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { user: req.user._id };
    if (status) {
      query.status = status;
    }
    
    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const total = await Payment.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        payments,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
    
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment history'
    });
  }
});

// @route   GET /api/payment/subscription
// @desc    Get user's current subscription
// @access  Private
router.get('/subscription', authenticate, async (req, res) => {
  try {
    const user = req.user;
    
    let subscriptionData = {
      plan: user.subscription.plan,
      status: user.subscription.status,
      currentPeriodEnd: user.subscription.currentPeriodEnd,
      cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd
    };
    
    // Get detailed subscription info from Stripe if available
    if (user.subscription.stripeSubscriptionId) {
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(
          user.subscription.stripeSubscriptionId
        );
        
        subscriptionData = {
          ...subscriptionData,
          stripeStatus: stripeSubscription.status,
          nextPayment: new Date(stripeSubscription.current_period_end * 1000),
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end
        };
      } catch (stripeError) {
        console.error('Failed to get Stripe subscription:', stripeError);
      }
    }
    
    res.json({
      success: true,
      data: {
        subscription: subscriptionData
      }
    });
    
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription info'
    });
  }
});

// @route   POST /api/payment/cancel-subscription
// @desc    Cancel user's subscription
// @access  Private
router.post('/cancel-subscription', authenticate, async (req, res) => {
  try {
    const user = req.user;
    
    if (!user.subscription.stripeSubscriptionId) {
      return res.status(400).json({
        success: false,
        message: 'No active subscription found'
      });
    }
    
    // Cancel subscription at period end
    const subscription = await stripe.subscriptions.update(
      user.subscription.stripeSubscriptionId,
      {
        cancel_at_period_end: true
      }
    );
    
    // Update user record
    user.subscription.cancelAtPeriodEnd = true;
    await user.save();
    
    res.json({
      success: true,
      message: 'Subscription will be cancelled at the end of the current period',
      data: {
        cancelAtPeriodEnd: true,
        currentPeriodEnd: user.subscription.currentPeriodEnd
      }
    });
    
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription'
    });
  }
});

// @route   GET /api/payment/plans
// @desc    Get available subscription plans
// @access  Public
router.get('/plans', async (req, res) => {
  try {
    const plans = [
      {
        id: 'basic',
        name: 'Basic',
        description: 'Perfect for individuals getting started',
        features: [
          '100 media uploads',
          '1GB storage',
          'Basic support',
          'Standard upload size (25MB)'
        ],
        prices: {
          monthly: { amount: 999, currency: 'usd' }, // $9.99
          yearly: { amount: 9999, currency: 'usd' }  // $99.99
        }
      },
      {
        id: 'premium',
        name: 'Premium',
        description: 'For professionals and growing businesses',
        features: [
          '1,000 media uploads',
          '10GB storage',
          'Priority support',
          'Large upload size (100MB)',
          'Advanced analytics',
          'Custom branding'
        ],
        prices: {
          monthly: { amount: 1999, currency: 'usd' }, // $19.99
          yearly: { amount: 19999, currency: 'usd' }  // $199.99
        }
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'For large organizations with advanced needs',
        features: [
          'Unlimited uploads',
          'Unlimited storage',
          '24/7 dedicated support',
          'Huge upload size (500MB)',
          'Advanced analytics',
          'Custom branding',
          'API access',
          'SSO integration'
        ],
        prices: {
          monthly: { amount: 4999, currency: 'usd' }, // $49.99
          yearly: { amount: 49999, currency: 'usd' }  // $499.99
        }
      }
    ];
    
    res.json({
      success: true,
      data: { plans }
    });
    
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription plans'
    });
  }
});

module.exports = router;
