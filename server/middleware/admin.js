const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const token = req.header("x-auth-token");
    
    // Check if token is provided
    if (!token) return res.status(401).send({ message: "Access Denied, no token provided" });

    // Verify the token
    jwt.verify(token, process.env.JWTPRIVATEKEY, (error, validToken) => {
        if (error) {
            return res.status(401).send({ message: "Invalid token" });
        } else {
            // Check if the user has admin privileges
            if (!validToken.isAdmin) {
                return res.status(403).send({ message: "You don't have access to this content" });
            }
            // Attach the user to the request object and proceed
            req.user = validToken;
            next();
        }
    });
};
