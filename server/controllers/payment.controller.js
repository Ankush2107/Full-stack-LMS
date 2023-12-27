import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import { razorpay } from "../server.js";
import AppError from "../utils/AppError.js";

const getRazorPayApiKey = async(req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Razorpay API key',
            key: process.env.RAZORPAY_KEY_ID
        })
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
}

const buySubscription = async(req, res, next) => {
    try {
        const { id } = req.user;
    const user = await User.findById(id);

    if(!user) {
        return next(new AppError('Unauthorized, please login'))
    }
    
    if(user.role === 'ADMIN') {
        return next(new AppError('Admin cannot purchase a subscription', 400));
    }

    const subscription = await razorpay.subscriptions.create({
        plan_id: process.env.RAZORPAY_PLAN_ID,
        customer_notify: 1
    });

    user.subscription.id = subscription.id;
    user.subscription.status = subscription.status;

    await user.save();

    res.status(200).json({
        success: true,
        message: 'Subscribed successfully',
        subscription_id: subscription.id
    });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
}

const verifySubscription = async(req, res, next) => {
    try {
        const { id } = req.user;
        const { razorpay_payment_id, razorpay_signature, razorpay_subscription_id} = req.body;

        const user = await User.findById(id);
        if(!user) {
            return next(new AppError('Unauthorized, please login'));
        }

        const subscriptionId = user.subscription.id;

        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET)
            .update(`${razorpay_payment_id} | ${subscriptionId}`)
            .digest('hex')

        if(generatedSignature !== razorpay_signature) {
            return next(new AppError('Payment not verified, please try again', 500));
        }
        
        await Payment.create({
            razorpay_payment_id,
            razorpay_signature,
            razorpay_subscription_id
        });

        user.subscription.status = 'active';
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Payment verified successfully'
        })
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
}

const cancelSubscription = async(req, res, next) => {
    try {
        const { id } = req.user;
        const user = await User.findById(id);

        if(!user) {
            return next(new AppError('Unauthorized, please login'))
        }
        
        if(user.role === 'ADMIN') {
            return next(new AppError('Admin cannot purchase a subscription', 400));
        }

        const subscriptionId = user.subscription.id;
        const subscription = await razorpay.subscription.cancel(
            subscriptionId
        )

        user.subscription.status = subscription.status;
        await user.save();
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
}

const allPayments = async(req, res, next) => {
    try {
        const { count } = req.query;

        const subscription = await razorpay.subscription.all({
            count: count || 10
        });

        res.status(200).json({
            success: true,
            message: 'All Payments',
            subscription        
        })
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
}

export {
    getRazorPayApiKey,
    buySubscription,
    verifySubscription,
    cancelSubscription,
    allPayments
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