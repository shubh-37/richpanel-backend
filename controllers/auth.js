const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function userDefinedException(message, statusCode) {
  this.message = message;
  this.statusCode = statusCode;
}
function auth(app, Models) {
  const { User } = Models;
  app.post("/register", async function register(req, res) {
    const { name, emailId, password } = req.body;
    try {
      if (!emailId || !password || !name) {
        throw new userDefinedException(
          "Please enter all the input fields.",
          401
        );
      }
      const userInstance = await User.findOne({ emailId });
      if (userInstance) {
        return res
          .status(409)
          .json({ message: `User with email ID: ${emailId} already exists.` });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const user = await User.create({
        name,
        emailId,
        password: hashedPassword,
      });
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "24 h",
      });
      return res.status(201).json({ token: token, emailId: emailId });
    } catch (error) {
      // if (error.message.match("E11000 duplicate key error collection:")) {
      //   return res.status(409).json({ message: "Duplicate User" });
      // }
      return res.status(500).json({ message: error.message });
    }
  });

  app.post("/login", async function login(req, res) {
    const { emailId, password } = req.body;
    try {
      if (!emailId || !password) {
        throw new userDefinedException(
          "Please enter both Email and Password",
          401
        );
      }
      const userInstance = await User.findOne({ emailId });
      if (!userInstance) {
        throw new userDefinedException("No user found!", 404);
      }
      const isPasswordCorrect = await bcrypt.compare(
        password,
        userInstance.password
      );
      if (!isPasswordCorrect) {
        throw new userDefinedException("Wrong password!", 401);
      }

      const token = jwt.sign(
        { _id: userInstance._id },
        process.env.JWT_SECRET,
        {
          expiresIn: "24 h",
        }
      );

      return res.status(200).json({ token });
    } catch (error) {
      return res.status(error.statusCode).json({ message: error.message });
    }
  });
}

module.exports = auth;
