import AppError from "../utils/error.util.js";
import User from "../models/user.model.js";
import cloudinary from 'cloudinary';
import fs from 'fs/promises';
import sendEmail from "../utils/sendEmail.js";
import crypto from 'crypto';


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
        return next (new AppError('All feilds are required', 400));
    }

    // Checks if a user with the provided email already exists.
    const userExists = await User.findOne({ email });
    if(userExists) {
        return next(new AppError("Email already exists", 400));
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
        return next(new AppError("User registration failed please try again", 400))
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
            return next(new AppError(error || 'file not uploaded, please try again', 500));
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
            return next(new AppError('All fields are required', 400));
        };

        // Finds the user by email and checks if the provided password matches.
        const user = await User.findOne({ email }).select('+password');
        if(!user || !user.comparePassword(password)) {
            return next (new AppError('Email or password does not match', 400))
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
        return next(new AppError(error.message, 500));
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
        return next (new AppError('Failed to fetch profile', 400))
    }
};

const forgotPassword = async (req, res, next) => {
    // Extracting email from request body
    const { email } = req.body;
  
    // If no email send email required message
    if (!email) {
      return next(new AppError('Email is required', 400));
    }
  
    // Finding the user via email
    const user = await User.findOne({ email });
  
    // If no email found send the message email not found
    if (!user) {
      return next(new AppError('Email not registered', 400));
    }
  
    // Generating the reset token via the method we have in user model
    const resetToken = await user.generatePasswordResetToken();
  
    // Saving the forgotPassword* to DB
    await user.save();
  
    // constructing a url to send the correct data
    /**HERE
     * req.protocol will send if http or https
     * req.get('host') will get the hostname
     * the rest is the route that we will create to verify if token is correct or not
     */
    // const resetPasswordUrl = `${req.protocol}://${req.get(
    //   "host"
    // )}/api/v1/user/reset/${resetToken}`;
    const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  
    // We here need to send an email to the user with the token
    const subject = 'Reset Password';
    const message = `You can reset your password by clicking <a href=${resetPasswordUrl} target="_blank">Reset your password</a>\nIf the above link does not work for some reason then copy paste this link in new tab ${resetPasswordUrl}.\n If you have not requested this, kindly ignore.`;
  
    try {
      await sendEmail(email, subject, message);
  
      // If email sent successfully send the success response
      res.status(200).json({
        success: true,
        message: `Reset password token has ben sent to ${email} successfully`,
      });e
    } catch (error) {
      // If some error happened we need to clear the forgotPassword* fields in our DB
      user.forgotPasswordToken = undefined;
      user.forgotPasswordExpiry = undefined;
  
      await user.save();
  
      return next(new AppError(error.message || 'Something went wrong, please try again.', 500));
    }
  };

const resetPassword = async (req, res, next) => {
    const { resetToken } = req.params;
    const { password } = req.params;

    const forgotPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')

    const user = await User.findOne({ 
        forgotPasswordToken,
        forgotPasswordExpiry: { $gt: Date.now() }
    })
    
    if(!user) {
        return next(new AppError('Token is invalid or expired, please try again', 400));
    }

    user.password = password;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    user.save();

    res.status(200).json({
        success: true,
        message: 'Password changed successfully!'
    })

};

const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const { id } = req.user;

    if(!oldPassword || !newPassword) {
        return next(new AppError('All fields are mandatory', 400));
    }

    const user = await User.findById(id).select('+password');

    if(!user) {
        return next(new AppError('User does not exist', 400));
    }

    const isPasswordValid = await user.comparePassword(oldPassword);

    if(!isPasswordValid) {
        return next(new AppError('Invalid old password', 400));
    }

    await user.save();

    user.password = undefined;

    res.status(200).json({
        success: true,
        message: 'Password changed successfully'
    })
};

export { register, login, logout, getProfile, forgotPassword, resetPassword };