export const register = async (req, res, next) => {
    try {
        res.send(req.body);
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