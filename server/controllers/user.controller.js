import AppEroor from "../utils/error.util.js";
import User from "../models/user.model.js";
import cloudinary from 'cloudinary';
import fs from 'fs/promises';

// Ensures that the authentication token cookie is secure and has an expiration time.
const cookieOptions = {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true
}

// register
const register = async (req, res, next) => {
    const { fullName, email, password } = req.body;

    // Ensures that all required registration fields are provided.
    // Prevents incomplete user registrations.
    if(!fullName || !email || !password) {
        return next (new AppEroor('All feilds are required', 400));
    }

    // Checks if a user with the provided email already exists.
    const userExists = await User.findOne({ email });
    if(userExists) {
        return next(new AppEroor("Email already exists", 400));
    }

    // Creates a new user with the provided details.
    const user = await User.create({
        fullName, 
        email,
        password,
        avatar: {
            public_id: email,
            secure_url: 'https://res.cloudinary.com/du9jzqlpt/image/upload/v1674647316/avatar_drzgxv.jpg',
        }
    })
    if(!user) {
        return next(new AppEroor("User registration failed please try again", 400))
    }

    // File upload

    if(req.file) {
        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms',
                width: 250, 
                height: 250,
                gravity: 'faces',
                crop: 'fill'
            });

            if(result) {
                user.avatar.public_id = result.public_id;
                user.avatar.secure_url = result.secure_url;

                // Remove file from server
                fs.rm(`uploads/${req.file.filename}`);
            };
        } catch (error) {
            return next(new AppEroor(error || 'file not uploaded, please try again', 500));
        };
    };

    // Saves the user to the database and generates a JWT token for authentication.
    await user.save();
    user.password = undefined;
    const token = await user.generateJWTToken();

    // Sets the authentication token cookie in the response and sends a success response.
    res.cookie('token', token, cookieOptions)
    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user,
    })
};


// login
const login = async (req, res, next) => {
    try {
        // Allows users to log in with their email and password.
        const { email, password } = req.body;

        // Ensures that all required login fields are provided.
        if(!email || !password) {
            return next(new AppEroor('All fields are required', 400));
        };

        // Finds the user by email and checks if the provided password matches.
        const user = await User.findOne({ email }).select('+password');
        if(!user || !user.comparePassword(password)) {
            return next (new AppEroor('Email or password does not match', 400))
        }

        // Generates a new JWT token for the logged-in user and sets the cookie in the response.
        const token = await user.generateJWTToken();
        user.password = undefined;
        res.cookie('token', token, cookieOptions);
        res.status(200).json({
            success: true,
            message: 'User loggedin successfully',
            user,
        });
    } catch (error) {
        return next(new AppEroor(error.message, 500));
    }
};

// logout
// Logs out the user by clearing the authentication token cookie.
const logout = (req, res) => {

    //  Clears the authentication token cookie and sends a success response.
    res.cookie('token', null, {
        secure: true,
        maxAge: 0, 
        httpOnly: true
    });
    res.status(200).json({
        success: true,
        message: 'User logged out successfully'
    })
};

// getting profile
// Provides user details for display in the application.
const getProfile = async (req, res) => {
    try {
        // Retrieves the user profile by ID and sends a success response
        const userId = req.user.id;
        const user = await User.findById(userId);
        res.status(200).json({
            success: true,
            manage: 'User details',
            user, 
        })
    } catch (error) {
        return next (new AppEroor('Failed to fetch profile', 400))
    }
};

export { register, login, logout, getProfile };