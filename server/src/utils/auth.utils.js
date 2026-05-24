import transporter
from "../config/mail.js";

// GENERATE OTP

export const generateOTP =
  () => {

    return Math.floor(

      100000 +

      Math.random() * 900000

    ).toString();

};

// SEND OTP EMAIL

export const sendOTPEmail =
  async (email, otp) => {

    await transporter.sendMail({

      from:
        process.env.EMAIL_USER,

      to: email,

      subject:
        "TripShare Password Reset OTP",

      html: `

        <div style="
          font-family: Arial;
          padding: 20px;
        ">

          <h2>
            TripShare 🔐
          </h2>

          <p>
            Your OTP for password reset is:
          </p>

          <h1 style="
            color: #facc15;
            letter-spacing: 5px;
          ">
            ${otp}
          </h1>

          <p>
            OTP valid for 10 minutes.
          </p>

        </div>

      `,

    });

};