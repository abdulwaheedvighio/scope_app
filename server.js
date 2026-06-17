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

// DB connect (safe for Vercel)
// mongoose.connect(process.env.MONGO_URI, {
//   serverSelectionTimeoutMS: 30000,
// })
// .then(() => console.log("MongoDB Connected 🚀"))
// .catch((err) => console.log("Mongo Error ❌", err));

// ❌ NO app.listen (IMPORTANT)
app.listen(5000, () => {
  console.log("Server running on 5000");
});
// export for Vercel
module.exports = app;