const express =require('express');
const app = express();
require("dotenv").config();
const connectDB = require("./connect");
const authController = require("./controllers/auth.js");
const subscriptionController = require('./controllers/subscriptions');
const cors = require("cors");

//middlewares
app.use(express.json());
app.use(cors());

try {
  async function start() {
    const { Models } = await connectDB();
    console.log('Connection successful with Database');
    authController(app, Models);
    subscriptionController(app, Models);
    app.listen(process.env.PORT || 3000, console.log(`server listening on port:${process.env.PORT || 3000}`));
  }
  start();
} catch (error) {
  console.error("Sorry! Cannot start the server!", error);
}