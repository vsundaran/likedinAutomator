const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendOTPEmail = async (email, otp, type) => {
    let subject = "";
    let text = "";

    switch (type) {
        case "signup":
            subject = "Verify your account - Vibe2EarnAI";
            text = `Your OTP for signup is: ${otp}. It will expire in 10 minutes.`;
            break;
        case "login":
            subject = "Login Verification - Vibe2EarnAI";
            text = `Your OTP for login is: ${otp}. It will expire in 10 minutes.`;
            break;
        case "reset_password":
            subject = "Reset your password - Vibe2EarnAI";
            text = `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`;
            break;
        default:
            subject = "Verification Code - Vibe2EarnAI";
            text = `Your verification code is: ${otp}. It will expire in 10 minutes.`;
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        text: text,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP email sent to ${email}`);
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send OTP email");
    }
};

module.exports = { sendOTPEmail };
