import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import {
  login,
  logout,
  setOTP,
  getUser,
  customerRegister,
} from "./database/auth.js";
import { sendEmail } from "./helper/email.js";
import { getOTP } from "./helper/helper.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());

// >login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const session = await login(email, password);
  if (session) {
    res.cookie("session", session, { maxAge: 60 * 60 * 1000, httpOnly: true });
    res.status(200).send(JSON.stringify({ msg: "OK" }));
  } else {
    res.status(400).send(JSON.stringify({ msg: "NOT OK" }));
  }
});

// >logout
app.get("/api/auth/logout", async (req, res) => {
  const session = req.cookies.session;
  await logout(session);
  res.clearCookie("session");
  res.end();
});

// >customer register
app.post("/api/auth/register/customer", async (req, res) => {
  const { name, email, phone, password } = req.body;
  const result = await customerRegister(name, email, phone, password);
  if (result) res.status(200).send(JSON.stringify({ msg: "OK" }));
});

// >send email
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
  await setOTP(otp, session);
  const user = await getUser(session);
  await sendEmail(user.email, subject, content);
  res.status(200).send(JSON.stringify({ msg: "OK" }));
});

// app.get("/user", async (req, res) => {
//   const users = await getAllUser();
//   res.send(users);
// });

// app.get("/user/:id", async (req, res) => {
//   const id = req.params.id;
//   const user = await getUser(id);
//   res.send(user);
// });

// app.post("/user", async (req, res) => {
//   const { email, contents } = req.body;
//   const note = await createUser(title, contents);
//   res.status(201).send(note);
// });

app.listen(process.env.SERVER_PORT, () => {
  console.log(`
    Server is running...
    Port: ${process.env.SERVER_PORT}
    URL: http://localhost:${process.env.SERVER_PORT}/
    `);
});
