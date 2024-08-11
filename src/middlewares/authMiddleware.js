import createHttpError from "http-errors"
import { verifyToken } from "../utils/token-functions.js";
// import { findUser } from "../services/user-services-functions.js";

//every request that comes in from the front end always has a headers object. We want to check this headers object to see if this request is coming from an authenticated user.
// the headers object needs to have a key value pair-- an `authorization` key with a value containing a bearer token, with the bearer token following the standard `Bearer <access_key>` format. If this exists, then it means the incoming request is coming from an authenticated user
export const authMiddleware = async (req, res, next) => {
    if(!req.headers['authorization']){
        return next(createHttpError.Unauthorized()); 
    };

    //extract the bearer token from the incoming front end request inside the headers object
    const bearerToken = req.headers['authorization'];

    //extract only the access token/key portion => ["Bearer", "<access key>"]
    const splitBearerToken = bearerToken.split(" ")[1];

    //compare the front end user's access token to our secret access token using jsonwebtoken. If it matches, then it should spit out a user object containing the user id that verifies them
    const verifiedUser = await verifyToken(splitBearerToken, process.env.SECRET_ACCESS_TOKEN);
    console.log(verifiedUser);

    if(verifiedUser){
        // const userData = findUser(verifiedUser.id);
        req.user = verifiedUser,
        next();
    };
};