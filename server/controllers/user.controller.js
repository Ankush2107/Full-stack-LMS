import AppEroor from "../utils/error.util.js";
import User from "../models/user.model.js";


const cookieOptions = {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true
}

// register
const register = async (req, res, next) => {
    const { fullName, email, password } = req.body;

    if(!fullName || !email || !password) {
        return next (new AppEroor('All feilds are required', 400));
    }

    const userExists = await User.findOne({ email });

    if(userExists) {
        return next(new AppEroor("Email already exists", 400));
    }

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

    // TODO: File upload

    await user.save();

    user.password = undefined;

    const token = await user.generateJWTToken();

    res.cookie('token', token, cookieOptions)

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user,
    })
};

// login
const login = async (req, res) => {
    try {
        const { emai, password } = req.body;

        if(!email || !password) {
            return next(new AppEroor('All fields are required', 400));
        };

        const user = await User.findOne({
            email
        }).select('+password');

        if(!user || !user.comparePassword(password)) {
            return next (new AppEroor('Email or password does not match', 400))
        }

        const token = await user.generateJWTToken();
        user.password = undefined;

        res.cookie('token', token, cookieOptions);

        res.status(200).json({
            success: true,
            message: 'User loggedin successfully',
            user,
        });
    } catch (error) {
        return next(new AppEroor(e.message, 500));
    }
};

const logout = (req, res) => {
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

const getProfile = async (req, res) => {
    try {
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


export {
    register,
    login,
    logout,
    getProfile
};