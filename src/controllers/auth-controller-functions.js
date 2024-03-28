import createHttpError from "http-errors";

import { createAndAddUserToDB, findUser } from "../services/user-services-functions.js";

export const register = async (req, res, next) => {
    try {
        //extract pieces of form data from the incoming request from the front end
        const {firstName, lastName, email, password, confirmPassword, picture, status} = req.body;

        //additional check to see if the email is already registered to a user in the database

        // const existingUser = await findUser(email);
        // if(existingUser){
        //     throw createHttpError.BadRequest("The provided email address is already registered to an existing user. Please use a different email address");
        // };

        //create a new user and add to DB using the data from the front end
        const newUser = await createAndAddUserToDB({
            firstName,
            lastName,
            email, 
            password,
            confirmPassword,
            picture,
            status
        });

        res.status(200).json(newUser);

        // generate access token using our secret access token. Should be valid for 24 hrs

        //generate refresh token using our secret refresh token. Should be valid for 30 days

        //store refresh token on on the server. This is used to generate a new access token for the user
        // res.status.(500).json({message: error.message})
    } catch(error) {
        next(error); // using this instead => next will pass this error to the next middleware for error handling, which is the error handling middleware we defined in app.js
    }
}
export const login = async (req, res, next) => {
    try {
        // res.status.(500).json({message: error.message})
    } catch(error) {
        next(error); // using this instead => next will pass this error to the next middleware for error handling, which is the error handling middleware we defined in app.js
    }
}
export const logout = async (req, res, next) => {
    try {
        // res.status.(500).json({message: error.message})
    } catch(error) {
        next(error); // using this instead => next will pass this error to the next middleware for error handling, which is the error handling middleware we defined in app.js
    }
}
export const refreshToken = async (req, res, next) => {
    try {
        // res.status.(500).json({message: error.message})
    } catch(error) {
        next(error); // using this instead => next will pass this error to the next middleware for error handling, which is the error handling middleware we defined in app.js
    }
}