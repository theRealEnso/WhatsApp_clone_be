import createHttpError from "http-errors";

import { createAndAddUserToDB, signInUser, findUser, getUsers } from "../services/user-services-functions.js";
import { generateToken, verifyToken } from "../utils/token-functions.js";
import { capitalizeFirstLetterInName } from "../utils/capitalize.js";

// const secret_access_token = process.env.SECRET_ACCESS_TOKEN; // DOES NOT WORK FOR SOME REASON
// const secret_refresh_token = process.env.SECRET_REFRESH_TOKEN; // DOES NOT WORK FOR SOME REASON

export const register = async (req, res, next) => {
    try {
        //extract pieces of form data from the incoming request body from the front end
        const {firstName, lastName, email, password, confirmPassword, picture, status} = req.body;

        //create a new user and add to DB using the incoming data from the front end. No need to perform additional check to see if user already exists in DB, is already handled by validation

        const capitalizedFirstName = capitalizeFirstLetterInName(firstName);
        const capitalizedLastName = capitalizeFirstLetterInName(lastName);

        const newUser = await createAndAddUserToDB({
            firstName: capitalizedFirstName,
            lastName: capitalizedLastName,
            email, 
            password,
            confirmPassword,
            picture,
            status
        });
        
        const userId = newUser._id;

        // generate access token using our secret access token to attach to the user (using their ID). Should be valid for 24 hrs
        const userAccessToken = await generateToken({id: userId}, process.env.SECRET_ACCESS_TOKEN, "1d");

        //generate refresh token using our secret refresh token to attach to the user (using their ID). Should be valid for 30 days
        const userRefreshToken = await generateToken({id: userId}, process.env.SECRET_REFRESH_TOKEN, "30d");

        //store refresh token on on the server. This is used to generate a new access token for the user. Should be valid for 30 days
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30);
        res.cookie("refreshToken", userRefreshToken, { //res.cookie takes 3 params: 1.) name of the cookie 2.) data to store in cookie, 3.) options object
            path: "/api/v1/auth/refreshToken",
            httpOnly: true,
            expires: expirationDate,
        });

        res.json({
            message: "User successfully registered!",
            user: {
                // ...newUser,
                _id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                picture: newUser.picture,
                status: newUser.status,
                access_token: userAccessToken,
            }
        });

    } catch(error) {
        next(error); // using this instead => next will pass this error to the next middleware for error handling, which is the error handling middleware we defined in app.js
    };
};

export const login = async (req, res, next) => {
    try {
        //pull email and password from the front end
        const {email, password} = req.body;

        //find user in the database using email and verify the password
        const user = await signInUser(email, password);

        //generate new access token for the user
        const signedInUserId = user._id;
        const userAccessToken = await generateToken({id: signedInUserId}, process.env.SECRET_ACCESS_TOKEN, "1d");
        
        //generate refresh token for the user
        const userRefreshToken = await generateToken({id: signedInUserId}, process.env.SECRET_REFRESH_TOKEN, "30d");

        //store refresh token in cookie on the server
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30);
        res.cookie("refreshToken", userRefreshToken, {
            path: "/api/v1/auth/refreshToken",
            httpOnly: true,
            expires: expirationDate,
        });

        res.json({
            message: "User successfully signed in!",
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                picture: user.picture,
                status: user.status,
                access_token: userAccessToken,
            }
        })

    } catch(error) {
        next(error); // using this instead => next will pass this error to the next middleware for error handling, which is the error handling middleware we defined in app.js
    };
};

export const logout = async (req, res, next) => {
    try {
        res.clearCookie("refreshToken", {path: "/api/v1/auth/refreshToken"});
        res.json({
            message: "Successfully logged the user out!",
        })
        // res.status.(500).json({message: error.message})
    } catch(error) {
        next(error); // using this instead => next will pass this error to the next middleware for error handling, which is the error handling middleware we defined in app.js
    }
}
// use stored refresh token on the server to generate a new access token for the user
export const refreshToken = async (req, res, next) => {
    try {
        //retrieve refresh token from stored cookie on the server
        const storedRefreshToken = req.cookies.refreshToken;
        if(!storedRefreshToken) throw createHttpError.Unauthorized("Refresh token not found or expired. Please log back into your account");

        //verify the user and their ID using the stored refresh token, checking it against our secret refresh token
        const verifiedUser = await verifyToken(storedRefreshToken, process.env.SECRET_REFRESH_TOKEN); // jwt function returns a user object containing the user id:
        // ex: { 
        //     id: '6605fc4592477b6c97075693', 
        //     iat: 1711668294, 
        //     exp: 1714260294 
        // }
        console.log(verifiedUser);
        // res.send(verifiedUser);

        //once user ID is verified, then use the the ID to generate a new access token
        if(!verifiedUser) throw createHttpError.Unauthorized("Invalid or expired refreshToken");

        const newAccessToken = await generateToken({id: verifiedUser.id}, process.env.SECRET_ACCESS_TOKEN, "1d");

        const user = await findUser(verifiedUser.id);

        res.json({
            message: "successfully generated a new access token for the user!",
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                picture: user.picture,
                status: user.status,
                access_token: newAccessToken,
            }
        });
        // res.status.(500).json({message: error.message})
    } catch(error) {
        next(error); // using this instead => next will pass this error to the next middleware for error handling, which is the error handling middleware we defined in app.js
    };
};