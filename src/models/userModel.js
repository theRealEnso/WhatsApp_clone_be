import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";

//define data model for the user with validation rules
//https://mongoosejs.com/docs/validation.html
const userSchema = mongoose.Schema(
    {
        firstName: {
            type: String,
            required: [true, "First name is required"],
            minLength: [2, "Please make sure your first name is greater than 2 characters"],
            maxLength: [24, "Please make sure your first name does not exceed 24 characters "]
        },
        lastName: {
            type: String,
            required: [true, "Last name is required"],
            minLength: [2, "Please make sure your last name is greater than 2 characters"],
            maxLength: [24, "Please make sure your last name does not exceed 24 characters "]
        },
        email: {
            type: String,
            required: [true, "Email name is required"],
            lowercase: true,
            validate: [validator.isEmail, "Please provide a valid email address"], // function
            unique: [true, "Email address is already registered to an existing user. Please use another email address"] // unique ensures each document must have a unique email for validation purposes
        },
        password: {
            type: String,
            required: [true, "Password name is required"],
            minLength: [6, "Please make sure your password is at least 6 characters long"],
            maxLength: [128, "Please make sure your password does not exceed 64 characters"]
        },
        confirmPassword: {
            type: String,
            required: [true, "Please confirm your password"],
            minLength: [6, "Please make sure your password is at least 6 characters long"],
            maxLength: [128, "Please make sure your password does not exceed 64 characters"]
        },
        picture: {
            type: String,
            default: process.env.DEFAULT_PICTURE,
        },
        status: {
            type: String,
            default: process.env.DEFAULT_STATUS,
            minLength: [2, "Please make sure your status is at least 2 characters long"],
            maxLength: [64, "Please make sure your status does not exceed 64 characters"],
        },
    },

    {
        collection: "users", 
        timestamps: true,
    },
);

//middleware that executes before a document of this schema is saved to the database
// `save` argument specifies that this middleware should run before the save() function is called on a document of this schema
// using bcrypt package with promises => https://www.npmjs.com/package/bcrypt
userSchema.pre("save", async function (next) {
    try {
        if(this.$isNew) {
            const saltRounds = 12;
            const newSalt = await bcrypt.genSalt(saltRounds);
            const hashedPassword = await bcrypt.hash(this.password, newSalt);
            this.password = hashedPassword;
            this.confirmPassword = hashedPassword;
        }

        next(); //executes the next middleware in the chain, which should be the save() function when a document is being saved to the DB

    } catch (error) {
        next(error) //if error, then error is handled by the next middleware in the chain (which is our error handling middleware in the app.js file)
    }
});

export const UserModel = mongoose.models.UserModel || mongoose.model("UserModel", userSchema);