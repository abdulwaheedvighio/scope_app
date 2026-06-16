require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const otpRoutes = require("./routes/otp_routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", otpRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
  });

app.listen(process.env.PORT, () => {
  console.log(
    `Server running on port http://localhost:${process.env.PORT}`
  );
});