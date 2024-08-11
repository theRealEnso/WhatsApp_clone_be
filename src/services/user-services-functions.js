import { UserModel } from "../models/userModel.js";

import createHttpError from "http-errors";
import validator from "validator";
import bcrypt from "bcrypt"

//function to create a user and add to db
// argument userData passed into createUser is expected to be an object with properties firstName / lastName  / email / picture / status / password / confirmPassword
// cannot do {userData} with curly brackets because this says we are expecting an object that has a property called `userData`, and inside that userData itself contains properties name/email/picture/status

//no need to put code in a try/catch block because, the register function is already in a try/catch, and we have our error handling middleware in the app.js file to handle any errors. If we put a try/catch block then the try/catch will still handle the error, but the error handling middleware won't run because the the try/catch defined here handles it. Don't want this bc we want the server to send back the error message in a certain format
export const createAndAddUserToDB = async (userData) => {
    const {firstName, lastName, email, password, confirmPassword, picture, status} = userData;

    //check if a registered email already exists
    const foundUserInDB = await UserModel.findOne({email});
    if(foundUserInDB){
        throw createHttpError.Conflict("The email provided is already in use. Please try again with a different email address");
    }

    //check if required fields exist
    if(!firstName || !lastName || !email || !password || !confirmPassword){
        throw createHttpError.BadRequest("Please fill out all of the required fields!");
    };

    // check if passwords match
    if(password !== confirmPassword) {
        throw createHttpError.BadRequest("Please make sure that your passwords match!");
    };

    //check if firstName follows schema requirements
    if(!validator.isLength(firstName, {min: 2, max: 24})){
        throw createHttpError.BadRequest("Please make sure your first name is between 2 and 24 characters long");
    }

    //check if lastName follows schema requirements
    if(!validator.isLength(lastName, {min: 2, max: 24})){
        throw createHttpError.BadRequest("Please make sure your last name is between 2 and 24 characters long");
    }

    //check if email is valid
    if(!validator.isEmail(email)){
        throw createHttpError.BadRequest("Please provide a valid email address");
    };

    //check if password length matches schema requirements
    if(!validator.isLength(password, {min: 6, max: 64})){
        throw createHttpError.BadRequest("Please make sure your password is between 6 and 64 characters long");
    };

    //check if confirmPassword length matches schema requirements
    if(!validator.isLength(confirmPassword, {min: 6, max: 64})){
        throw createHttpError.BadRequest("Please make sure your confirmed password is between 6 and 64 characters long");
    };

    //check if status exists/was provided and the status length matches schema requirements

    if(status && !validator.isLength(status, {min: 2, max: 64})){
        throw createHttpError.BadRequest("Please make sure your status is between 2 and 64 characters long");
    };

    // create new user document to add to db
    //create new instance of `UserModel` schema (represents a document in MongoDB terms)
    //also performs validation based on the schema that was defined
    //can also do UserModel.create({}). Each has diff levels of control
    const user = await new UserModel({
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        picture: picture || process.env.DEFAULT_PICTURE,
        status: status || process.env.DEFAULT_STATUS,
    }).save(); // Internally, mongoose uses `insertOne()` function to add the document to collection. Always generates a `_id` for the document

    return user;
};

// function to find user in the database

export const signInUser = async (email, password) => {
    //find user in db using the email
    const existingUser = await UserModel.findOne({email: email});
    if(!existingUser) {
        throw createHttpError.BadRequest("User not found!");
    };

    // use bcrypt to compare the hashed password stored in db versus the password user inputted
    const hashedPassword = existingUser.password;
    const checkedPassword = await bcrypt.compare(password, hashedPassword);
    if(checkedPassword){
        return existingUser;
    } else {
        throw createHttpError.BadRequest("Passwords do not match!")
    }
};

export const findUser = async (id) => {
    const foundUser = await UserModel.findById(id);

    if(!foundUser) throw createHttpError.BadRequest("User not found!");

    return foundUser;
};

export const searchForUsers = async (keyword) => {
    const foundUser = await UserModel.find({
        $or: [
            {name: {$regex: keyword, $options: "i"}},
            {email: {$regex: keyword, $options: "i"}},
        ]
    });

    if(!foundUser) throw createHttpError.BadRequest("Whoops! Looks like we couldn't find what you were looking for...");

    return foundUser;
};

export const getUsers = async () => {
    const users = await UserModel.find({});

    if(!users) throw createHttpError.BadRequest("Whoops! Looks like something went wrong");

    return users;
};