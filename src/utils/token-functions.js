import jwt from "jsonwebtoken";

// jwt.sign(payload, secretOrPrivateKey, {options}, callback function) where options is an object that you can pass in properties like `algorithm, expiresIn`, etc)
//callback function will resolve either with an error if operation was unable to complete, or a generated token upon successful completion
//user ID is inside an object that passed in as the payload => generated token uses the user ID object + secret access token to generate the  "encoded" token
export const generateToken = async (payload, secretKey, timeIsValidFor) => {
    return new Promise(async (resolve, reject) => {
         await jwt.sign(payload, secretKey, {expiresIn: timeIsValidFor}, (error, generatedToken) => {
            if(error){
                reject(error)
            } else {
                resolve(generatedToken);
            };
         });
    });
};

// jwt.verify(token, secretOrPublicKey, [options, callback])
//Uses the previously generated "encoded" token to check against the secret refresh token => returns a verifiedToken, which is an object that contains the decoded payload, which is an object containing the ID of the user
export const verifyToken = async (storedRefreshToken , secretRefreshToken) => {
    return new Promise(async (resolve, reject) => {
         await jwt.verify(storedRefreshToken , secretRefreshToken, (error, verifedToken) => {
            if(error){
                reject(error)
            } else {
                resolve(verifedToken);
            };
         });
    });
};

//example of decoded verified token
// {
//     "id": "6605fc4592477b6c97075693",
//     "iat": 1712279102,
//     "exp": 1712365502
// }