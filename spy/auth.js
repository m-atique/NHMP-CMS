const jwt = require("jsonwebtoken");
//=============================================middleware jwt
module.exports = { verifyToken :(req, res, next) => {
  
  const token = req.headers["authorization"];
 
  const api_key = process.env.KEY
  if (!token) {
    return res.status(401).json({ error: "Unautherized : No token Provided" });
  }
  
  jwt.verify(token, api_key, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Unautherized : Invalid Token" });
    }
    
    req.user = decoded.user;
    next();
  });
}
}
//\\=========================================================