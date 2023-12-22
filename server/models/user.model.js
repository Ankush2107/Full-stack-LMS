import { Schema, model } from "mongoose";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new Schema({
    fullName: {
        type: String,
        required: [true, "Name is required"],
        minLength: [5, "Name must be atleast 5 character"],
        maxLength: [50, "Name should be less than 50 characters"],
        lowercase: true,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
        unique: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please fill in a valid email address',
        ],// Matches email against regex
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minLength: [8, "Password must be atleast 8 characters"],
        select: false  // Don't give password
    },
    avatar: {
        public_id: {
            type: String
        },
        secure_url: {
            type: String
        }
    },
    role: {
        type: String,
        enum: [ "USER", "ADMIN" ],
        default: 'USER'
    },
    forgetPasswordToken: String,
    forgetPasswordExpiry: Date
}, { timestamps: true });


//  Hashes the password before saving
userSchema.pre('save', async function (next){
    if(!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});


// Adds methods to the User model for JWT token generation and password comparison.
userSchema.methods = {
    generateJWTToken: async function (){
        // Generates a JWT token for the user.
        return await jwt.sign(
          { id: this._id, role: this.role, subscription: this.subscription }, // payload
          process.env.JWT_SECRET, // token secret
          {
            expiresIn: '1800s',  // configuration object
          }
        );
    },
    comparePassword: async function (plainTextPassword){
        // Compares a plain text password with the hashed password.
        return await bcrypt.compare(plainTextPassword, this.password);        
    }
}


const User = model('User', userSchema);

export default User;