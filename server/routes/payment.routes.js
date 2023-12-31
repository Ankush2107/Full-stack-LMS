import { Router} from 'express';
import { getPaymentApiKey, buySubscription, verifySubscription, cancelSubscription, getAllPayments } from '../controllers/payment.controller.js';
import { authorizedRoles, isLoggedIn } from '../middlewares/auth.middleware.js';
const router = Router();

router.route('/payment-key')
    .get(
        isLoggedIn,
        getPaymentApiKey
    );

router.route('/subscribe')
    .post(
        isLoggedIn,
        buySubscription
    );
    
router.route('/verify')
    .post(
        isLoggedIn,
        verifySubscription
    );    

router.route('/unsubscribe')
    .post(
        isLoggedIn,
        cancelSubscription
    );      

router.route('/')
    .get(
        isLoggedIn,
        authorizedRoles('ADMIN'),
        getAllPayments
    );
    
export default router;    