// middleware/apiKeyAuth.js
 function apiKeyAuth(req, res, next) {
  const clientKey = req.headers['x-api-key']; // custom header

  if (!clientKey || clientKey !== process.env.KEY) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid API Key' });
  }

  next();
}

module.exports = apiKeyAuth;
