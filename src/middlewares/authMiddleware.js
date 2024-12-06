import createHttpError from "http-errors"
import { verifyToken, generateToken } from "../utils/token-functions.js";
// import { findUser } from "../services/user-services-functions.js";

//every request that comes in from the front end always has a headers object. We want to check this headers object to see if this request is coming from an authenticated user.
// the headers object needs to have a key value pair-- an `authorization` key with a value containing a bearer token, with the bearer token following the standard `Bearer <access_key>` format. If this exists, then it means the incoming request is coming from an authenticated user
export const authMiddleware = async (req, res, next) => {
    if(!req.headers['authorization']){
        return next(createHttpError.Unauthorized("Authorization header missing")); 
    };

    //extract the bearer token from the incoming front end request inside the headers object
    const bearerToken = req.headers['authorization'];

    //extract only the access token/key portion of the "Bearer <acesss_token>" string => ["Bearer", "<access key>"]
    const accessToken = bearerToken.split(" ")[1];
    if(!accessToken){
        return next(createHttpError.Unauthorized("Access token missing or invalid"))
    };

    try {
        //compare the front end user's access token to our secret access token using jsonwebtoken. If it matches, then it should spit out a user object containing the user id that verifies them
        const verifiedUser = await verifyToken(accessToken, process.env.SECRET_ACCESS_TOKEN);
        console.log(verifiedUser);

        if(verifiedUser){
            // const userData = findUser(verifiedUser.id);
            req.user = verifiedUser,
            next(); // user is successfully authenticated
        };
    } catch (error) {
        console.log(error);
        if(error.name === "TokenExpiredError"){
            const refreshToken = req.cookies.refreshToken;
            if(!refreshToken) {
                return next(createHttpError.Unauthorized("Refresh token missing, please log back in again"))
            }

            //verify the refresh token
            try {
                const verifiedUser = await verifyToken(refreshToken, process.env.SECRET_REFRESH_TOKEN);
                if(!verifiedUser) {
                    return next(createHttpError.Unauthorized("Invalid refresh token"));
                }

                //generate new access token
                const newAccessToken = await generateToken({id: verifiedUser.id}, process.env.SECRET_ACCESS_TOKEN, "1d");

                //set new access token in the response header so that the front end can use it
                res.setHeader("Authorization", `Bearer ${newAccessToken}`);

                //Attach the verified user to the request and continue
                req.user = verifiedUser;
                next();
            } catch(error) {
                console.log(error);
                // If refresh token is invalid, prompt re-login
                return next(createHttpError.Unauthorized("Invalid refresh token, please log back in again"));
            }
        }
    }
};