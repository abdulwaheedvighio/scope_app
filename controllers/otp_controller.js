const Otp = require("../models/otp_model");
const nodemailer = require("nodemailer");
const connectDB = require("../lib/db");

// =======================
// 🔥 SEND OTP
// =======================
exports.sendOtp = async (req, res) => {
  
  try {
    await connectDB(); // 🔥 inside try (IMPORTANT)
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // OTP generate
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    // Save / Update OTP in DB
    await Otp.findOneAndUpdate(
      { email },
      {
        email,
        otp,
        expiresAt: expiry,
      },
      { upsert: true, new: true }
    );

    // =======================
    // SMTP TRANSPORT (FIXED)
    // =======================
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // verify connection (IMPORTANT DEBUG)
    await transporter.verify();

    // Send Email
   const info = await transporter.sendMail({
  from: `"SpermScope" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "🔐 SpermScope Email Verification OTP",

  html: `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 620px; margin: auto; background: #ffffff; border: 1px solid #eaeaea; border-radius: 14px; overflow: hidden;">

      <!-- HEADER -->
      <div style="background: linear-gradient(135deg, #2E86C1, #1B4F72); padding: 25px; text-align: center;">

        <img src="https://i.imgur.com/your-logo.png" alt="Logo" style="width: 70px; margin-bottom: 10px;" />

        <h1 style="color: #ffffff; margin: 0; font-size: 22px;">
          SpermScope Verification
        </h1>

      </div>

      <!-- BODY -->
      <div style="padding: 30px;">

        <p style="font-size: 16px; color: #333;">
          Hello User,
        </p>

        <p style="font-size: 15px; color: #555; line-height: 1.6;">
          We received a request to verify your email address. Use the OTP below to complete your verification process.
        </p>

        <!-- OTP BOX -->
        <div style="text-align: center; margin: 35px 0;">
          <div style="display: inline-block; padding: 18px 30px; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #2E86C1; background: #f0f7ff; border: 2px dashed #2E86C1; border-radius: 12px;">
            ${otp}
          </div>
        </div>

        <p style="font-size: 14px; color: #777; text-align: center;">
          This OTP is valid for <b>5 minutes</b>. Do not share it with anyone.
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />

        <p style="font-size: 14px; color: #999; text-align: center;">
          If you did not request this, ignore this email.
        </p>

      </div>

      <!-- FOOTER -->
      <div style="background: #f8f9fa; padding: 18px; text-align: center;">
        <p style="margin: 0; font-size: 13px; color: #666;">
          © 2026 SpermScope. All rights reserved.
        </p>
      </div>

    </div>
  `
});

    console.log("📩 Email Sent:", info.response);
    console.log("🔐 OTP Generated:", otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (error) {
    console.log("❌ SEND OTP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================
// 🔥 VERIFY OTP
// =======================
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP not found or already used",
      });
    }

    // Check expiry
    if (Date.now() > new Date(otpRecord.expiresAt).getTime()) {
      await Otp.deleteOne({ email });

      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    // Check OTP match
    if (otpRecord.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Delete OTP after success
    await Otp.deleteOne({ email });

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });

  } catch (error) {
    console.log("❌ VERIFY OTP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};