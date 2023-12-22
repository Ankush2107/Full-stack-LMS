import AppEroor from "../utils/error.util.js";
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

export { isLoggedIn };