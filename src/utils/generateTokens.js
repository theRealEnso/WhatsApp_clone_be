import jwt from "jsonwebtoken";

// jwt.sign(payload, secretOrPrivateKey, [options, callback]) where options is an object that you can pass in properties like `algorithm, expiresIn`, etc)
//user ID is inside an object that passed in as the payload => generated token uses the user ID object + secret access token to generate the  "encoded" token
export const generateToken = async (payload, secretKey, timeIsValidFor) => {
    return new Promise((resolve, reject) => {
         jwt.sign(payload, secretKey, {expiresIn: timeIsValidFor}, (error, generatedToken) => {
            if(error){
                reject(error)
            } else {
                resolve(generatedToken);
            };
         });
    });
};

// jwt.verify(token, secretOrPublicKey, [options, callback])
//Uses the previously generated "encoded" token to check against the secret refresh token => returns a verifiedToken, which is an object that contains the decoded payload, which is the user object containing the ID
export const verifyToken = async (storedRefreshToken , secretRefreshToken) => {
    return new Promise((resolve, reject) => {
         jwt.verify(storedRefreshToken , secretRefreshToken, (error, verifedToken) => {
            if(error){
                reject(error)
            } else {
                resolve(verifedToken);
            };
         });
    });
};