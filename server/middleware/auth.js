import jwt from "jsonwebtoken";

// This function runs before any protected route handler
// It checks the token and attaches the userId to the request
const auth = (req, res, next) => {
  // Tokens are sent in the Authorization header like:
  // "Authorization: Bearer eyJhbGci..."
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not authorised. Please log in." });
  }

  // Extract just the token part (remove "Bearer ")
  const token = authHeader.split(" ")[1];

  try {
    // Verify the token is valid and not expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the userId to the request so route handlers can use it
    req.userId = decoded.userId;

    // Continue to the actual route handler
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token. Please log in again." });
  }
};

export default auth;