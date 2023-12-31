import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import AppError from "../utils/AppError.js";
import { razorpay } from "../server.js";

const getPaymentApiKey = async(req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            message: 'API key',
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    };
};

const buySubscription = async (req, res, next) => {
    try {
      const { id } = req.user;
  
      // Checking user existence
      const user = await User.findById(id);
  
      if (!user) {
        return next(new AppError('Unauthorized, please login'));
      }
  
      // if user exists then validate if they are an admin or not
      if (user.role === 'ADMIN') {
        return next(new AppError('Admin cannot purchase a subscription', 400));
      }
  
      // Attempt to create a subscription
      const subscription = await razorpay.subscriptions.create({
        plan_id: process.env.RAZORPAY_PLAN_ID,
        customer_notify: 1,
        total_count: 1,
      });
  
      // Check if the subscription creation was successful
      if (!subscription || subscription.error) {
        return next(new AppError('Subscription creation failed', 500));
      }
  
      user.subscription.id = subscription.id;
      user.subscription.status = subscription.status;
  
      await user.save();
  
      res.status(200).json({
        success: true,
        message: 'Subscribed successfully',
        subscription_id: subscription.id,
      });
    } catch (error) {
      console.error('Error in buySubscription:', error);
      return next(new AppError(error.message, 500));
    }
  };

  const verifySubscription = async (req, res, next) => {
    try {
      const { id } = req.user;
      const { payment_id, signature, subscription_id } = req.body;
  
      // Checking user existence
      const user = await User.findById(id);
      if (!user) {
        return next(new AppError('Unauthorized, please login'));
      }
  
      // Check if the user has an active subscription
      const subscriptionId = user.subscription?.id;
      if (!subscriptionId) {
        return next(new AppError('User does not have an active subscription'));
      }
  
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_SECRET)
        .update(`${payment_id} | ${subscriptionId}`)
        .digest('hex');
  
      if (generatedSignature !== signature) {
        return next(new AppError('Payment not verified, please try again', 500));
      }
  
      await Payment.create({
        payment_id,
        signature,
        subscription_id,
      });
  
      user.subscription.status = 'active';
      await user.save();
  
      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
      });
    } catch (error) {
      return next(new AppError(error.message, 500));
    }
  };

  const cancelSubscription = async (req, res, next) => {
    try {
      // Extract user ID from the request
      const { id } = req.user;
  
      // Find the user in the database by ID
      const user = await User.findById(id);
  
      // Check if the user exists
      if (!user) {
        // If user does not exist, return an unauthorized error
        return next(new AppError('Unauthorized, please login'));
      }
  
      // Check if the user is an admin
      if (user.role === 'ADMIN') {
        // If the user is an admin, they cannot cancel a subscription
        return next(new AppError('Admin cannot purchase a subscription', 400));
      }
  
      // Get the subscription ID from the user's subscription object
      const subscriptionId = user.subscription?.id;
  
      // Check if the user has an active subscription
      if (!subscriptionId) {
        // If the user does not have an active subscription, return an error
        return next(new AppError('User does not have an active subscription'));
      }
  
      try {
        // Attempt to cancel the subscription using Razorpay API
        const subscription = await razorpay.subscriptions.cancel(subscriptionId);
  
        // Update user's subscription status in the database
        user.subscription.status = subscription.status;
        await user.save();
  
        // Return a success response if the cancellation is successful
        res.status(200).json({
          success: true,
          message: 'Subscription cancelled successfully',
        });
      } catch (error) {
        // Handle specific errors and send an appropriate response
        if (error.statusCode === 400) {
          // If the error is a Bad Request, provide a specific error message
          return next(new AppError('Bad Request. Please check your input.', 400));
        }
  
        // If the cancellation fails for other reasons, return a general error message
        return next(new AppError('Failed to cancel subscription', 500));
      }
    } catch (e) {
      // Catch any unexpected errors and return a general error response
      return next(new AppError(e.message, 500));
    }
  };
  
  const getAllPayments = async (req, res, next) => {
    try {
      // Extract the 'count' parameter from the query string
      const { count } = req.query;
  
      // Use the Razorpay API to retrieve subscriptions with the specified count (default to 10 if not provided)
      const subscriptions = await razorpay.subscriptions.all({
        count: parseInt(count) || 10, // Ensure 'count' is converted to an integer
      });
  
      // Return a success response with the list of subscriptions
      res.status(200).json({
        success: true,
        message: 'All Subscriptions', // Corrected the response message
        subscriptions,
      });
    } catch (error) {
      // If an error occurs, handle it and return an error response
      return next(new AppError(error.message, 500));
    }
  };
  
export {
    getPaymentApiKey,
    buySubscription,
    verifySubscription,
    cancelSubscription,
    getAllPayments
}



// To get the `RAZORPAY_KEY_ID`, you need to generate API keys in your Razorpay Dashboard. Here are the steps to generate API keys:

// 1. Log in to your Razorpay Dashboard with your credentials.
// 2. Once you are logged in, select the mode (Test or Live) for which you want to generate the API key.
// - Test Mode: The test mode is a simulation mode that you can use to test your integration flow. Your customers will not be able to make payments in this mode.
// - Live Mode: When your integration is complete, switch to live mode and generate live mode API keys. Replace test mode keys with live mode keys in the integration to accept payments from customers.
// 3. Navigate to Account & Settings → API Keys (under Website and app settings).
// 4. Click on the Generate Key button to generate the API key for the selected mode.
// 5. A pop-up page will appear with your `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.

// Make sure to securely store your API keys and never share them publicly. The `RAZORPAY_KEY_ID` is used to identify your account and authenticate API requests made to Razorpay.