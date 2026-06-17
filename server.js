require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const otpRoutes = require("./routes/otp_routes");

const app = express();

app.use(cors());
app.use(express.json());

// routes
app.use("/api", otpRoutes);

// home route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API is running successfully 🚀",
  });
});

// DB connect (safe for serverless)
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// ❌ REMOVE app.listen COMPLETELY

module.exports = app;