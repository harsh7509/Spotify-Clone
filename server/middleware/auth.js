const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    // Retrieve the token from the request header
    const token = req.header("x-auth-token");

    // If no token is provided, deny access
    if (!token) {
        return res.status(401).send({ message: "Access Denied, no token provided" });
    }

    // Verify the token
    jwt.verify(token, process.env.JWTPRIVATEKEY, (error, validToken) => {
        if (error) {
            // If token is invalid, send an error message
            return res.status(401).send({ message: "Invalid token" });
        } else {
            // If token is valid, attach the token payload to req.user
            req.user = validToken;
            next(); // Move to the next middleware or route handler
        }
    });
};
