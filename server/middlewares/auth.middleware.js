import AppError from "../utils/AppError.js";
import  jwt  from "jsonwebtoken";

// Defines a middleware function for checking user authentication status.
const isLoggedIn = async (req, res, next) => {
    const { token } = req.cookies;
    if(!token) {
        return next(new AppEroor('Unauthenticated, pleaselogin admin', 400));
    }
    const userDetails = await jwt.verify(token, process.env.JWT_SECRET);
    req.user = userDetails;
    next();
}

const authorizedRoles = (...roles) => async (req, res, next) => {
    const currentUserRole = req.user.role;
    if(!roles.includes(currentUserRole)) {
        return next(new AppError('You do not have permission', 403));
    }
    next();
}

const authorisedSubscriber = async (req, res, next) => {
    const subscription = req.user.subscription;
    const currentUserRole = req.user.role;
    if(currentUserRole !== 'ADMIN' || subscription.status !== 'active') {
        return next(new AppError('Please subscribe to access the route', 403));
    };
};

export { isLoggedIn, authorizedRoles, authorisedSubscriber };