const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if(!authHeader || authHeader.startsWith("Bearer ")){
    throw new Error("Authentication Invalid!");
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {userId: payload.userID};
    next();
  } catch (error) {
    console.error(error);
  }
}

module.exports = auth;