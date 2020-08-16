const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (token === "" || !token) {
      res.clearCookie("jwt");
      return res.json({ message: "User not logged in." });
    }
    const decoded = jwt.verify(token, process.env.JWT_KEY || "key");
    req.userData = decoded;
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({
      message: "Auth failed!",
    });
  }
};
