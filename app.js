import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import {
  login,
  logout,
  setOTP,
  confirmOTP,
  getUser,
  customerRegister,
  vendorRegister,
  confirmEmail,
  resetPassword,
} from "./database/auth.js";
import { sendEmail } from "./helper/email.js";
import { getOTP } from "./helper/helper.js";

dotenv.config();
const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// >login
app.post("/api/auth/login", async (req, res) => {
  const { email, password, remember_me } = req.body;
  const result = await login(email, password);
  let maxAge = 60 * 60 * 1000;
  if (remember_me) maxAge = 24 * 60 * 60 * 1000;
  if (result) {
    res.cookie("session", result.session, {
      maxAge: maxAge,
      httpOnly: true,
    });
    res.status(200).send(JSON.stringify({ role: result.role }));
  } else {
    res.clearCookie("session");
    res
      .status(400)
      .send(JSON.stringify({ msg: "Your email or password is incorrect!" }));
  }
});

// get user
app.get("/api/auth/get-user", async (req, res) => {
  const session = req.cookies.session;
  if (session) {
    const user = await getUser(session);
    delete user.otp;
    delete user.password;
    delete user.session;
    if (user) {
      res.status(200).send(JSON.stringify(user));
    } else {
      res.status(400).send(JSON.stringify({ msg: "NO USER" }));
    }
  } else {
    res.status(400).send(JSON.stringify({ msg: "NO USER" }));
  }
});

// >logout
app.get("/api/auth/logout", async (req, res) => {
  const session = req.cookies.session;
  await logout(session);
  res.clearCookie("session").status(200).end();
});

// >confirm email
app.post("/api/auth/confirm-email", async (req, res) => {
  const { email } = req.body;
  const session = await confirmEmail(email);
  if (session) {
    res.cookie("session", session, {
      maxAge: 60 * 60 * 1000,
      httpOnly: true,
    });
    res.status(200).send(JSON.stringify({ msg: "OK" }));
  } else {
    res.clearCookie("session");
    res.status(400).send(JSON.stringify({ msg: "Email address not found!" }));
  }
});

// >send otp
app.post("/api/auth/send-otp", async (req, res) => {
  const { subject } = req.body;
  const session = req.cookies.session;
  let content = "<h1>CampusCrave</h1>";
  const otp = getOTP();
  if (subject == "Email Verification") {
    content += `<p>Your OTP is <strong>${otp}</strong> for CampusCrave email verification.</p>`;
  } else if (subject == "Forgot Password") {
    content += `<p>Your OTP is <strong>${otp}</strong> for CampusCrave forgot password.</p>`;
  }
  try {
    await setOTP(otp, session);
    const user = await getUser(session);
    await sendEmail(user.email, subject, content);
    const encryptedEmail =
      user.email.split("@")[0].substring(0, 3) +
      "***@" +
      user.email.split("@")[1];
    res.status(200).send(
      JSON.stringify({
        msg: `Please check your email (${encryptedEmail}) for the OTP`,
      })
    );
  } catch (e) {
    res.status(400).send(
      JSON.stringify({
        msg: `NOT OK`,
      })
    );
  }
});

// >confirm otp
app.post("/api/auth/confirm-otp", async (req, res) => {
  const { otp, subject } = req.body;
  const session = req.cookies.session;
  let content = "";
  if (subject == "Email Verification") {
    content += `<h1>CampusCrave</h1> <p>Your email has been verified.</p>`;
  } else if (subject == "Forgot Password") {
    content += `<h1>CampusCrave</h1> <p>Your password has been reset.</p>`;
  }
  const result = await confirmOTP(otp, session);
  if (result) {
    const user = await getUser(session);
    await sendEmail(user.email, subject, content);
    res.status(200).send(JSON.stringify({ msg: "OK" }));
  } else {
    res.status(400).send(JSON.stringify({ msg: "Wrong OTP!" }));
  }
});

// >reset password
app.post("/api/auth/reset-password", async (req, res) => {
  const { password } = req.body;
  const session = req.cookies.session;
  const result = await resetPassword(password, session);
  if (result) {
    res.status(200).send(JSON.stringify({ msg: "OK" }));
  } else {
    res.status(400).send(JSON.stringify({ msg: "NOT OK" }));
  }
});

// >customer register
app.post("/api/auth/register/customer", async (req, res) => {
  const { name, email, phone, password } = req.body;
  const session = await customerRegister(name, email, phone, password);
  if (session) {
    res.cookie("session", session, {
      maxAge: 50 * 60 * 1000,
      httpOnly: true,
    });
    res.status(200).send(JSON.stringify({ msg: "OK" }));
  } else res.status(400).send(JSON.stringify({ msg: "NOT OK" }));
});

// >vendor register
app.post("/api/auth/register/vendor", async (req, res) => {
  const { vendorName, ownerName, email, phone, password } = req.body;
  const session = await vendorRegister(
    vendorName,
    ownerName,
    email,
    phone,
    password
  );
  console.log(session);
  if (session) {
    res.cookie("session", session, {
      maxAge: 50 * 60 * 1000,
      httpOnly: true,
    });
    res.status(200).send(JSON.stringify({ msg: "OK" }));
  } else res.status(400).send(JSON.stringify({ msg: "NOT OK [[[[[[" }));
});

app.listen(process.env.SERVER_PORT, () => {
  console.log(`
    Server is running...
    Port: ${process.env.SERVER_PORT}
    URL: http://localhost:${process.env.SERVER_PORT}/
    `);
});
