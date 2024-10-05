import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
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
  uploadAvatar,
  updateInformation,
  changePassword,
  getVendor,
  uploadVendorAvatar,
  updateVendorInformation,
} from "./database/auth.js";
import {
  getAllVendor,
  getVendor as getAVendor,
  approvedVendor,
} from "./database/vendor.js";
import { sendEmail } from "./helper/email.js";
import { getOTP } from "./helper/helper.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/avatar");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "." + file.mimetype.split("/")[1]);
  },
});
const avatar = multer({ storage: avatarStorage });

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

// get all vendor
app.get("/api/vendor", async (req, res) => {
  const vendor = await getAllVendor();
  if (vendor) res.status(200).send(JSON.stringify(vendor));
  else res.status(400).send(JSON.stringify({ msg: "NO VENDOR" }));
});

// get vendor
app.get("/api/vendor/:id", async (req, res) => {
  const id = req.params.id;
  const vendor = await getAVendor(id);
  if (vendor) res.status(200).send(JSON.stringify(vendor));
  else res.status(400).send(JSON.stringify({ msg: "NO VENDOR" }));
});

// approved vendor
app.get("/api/approved/:id", async (req, res) => {
  const id = req.params.id;
  const result = await approvedVendor(id);
  if (result) res.status(200).send(JSON.stringify({ msg: "OK" }));
  else res.status(400).send(JSON.stringify({ msg: "NOT OK" }));
});

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

// >get user
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

// >get vendor
app.get("/api/auth/get-vendor", async (req, res) => {
  const session = req.cookies.session;
  if (session) {
    const vendor = await getVendor(session);
    if (vendor) {
      res.status(200).send(JSON.stringify(vendor));
    } else {
      res.status(400).send(JSON.stringify({ msg: "NO VENDOR" }));
    }
  } else {
    res.status(400).send(JSON.stringify({ msg: "NO VENDOR" }));
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

// >change password
app.post("/api/auth/change-password", async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const session = req.cookies.session;
  const result = await changePassword(oldPassword, newPassword, session);
  if (result) {
    res.status(200).send(JSON.stringify({ msg: "OK" }));
  } else {
    res.status(400).send(JSON.stringify({ msg: "Old password is wrong!" }));
  }
});

// >update information
app.post("/api/auth/update-information", async (req, res) => {
  const { name, email, phone } = req.body;
  const session = req.cookies.session;
  const result = await updateInformation(name, email, phone, session);
  if (result) {
    res.status(200).send(JSON.stringify({ msg: "OK" }));
  } else {
    res.status(400).send(JSON.stringify({ msg: "NOT OK" }));
  }
});

// >update vendor information
app.post("/api/auth/update-vendor-information", async (req, res) => {
  const { name, description } = req.body;
  const session = req.cookies.session;
  const result = await updateVendorInformation(name, description, session);
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
  } else res.status(400).send(JSON.stringify({ msg: "NOT OK" }));
});

// >upload avatar
app.post("/api/upload-avatar", avatar.single("avatar"), async (req, res) => {
  const session = req.cookies.session;
  const img = req.file.path;
  const result = await uploadAvatar(session, img);
  if (result) res.status(200).send(JSON.stringify({ msg: "OK" }));
  else res.status(400).send(JSON.stringify({ msg: "NOT OK" }));
});

// >download avatar
app.post("/api/download-avatar", function (req, res) {
  const { fileName } = req.body;
  if (fileName) {
    const options = {
      root: path.join(__dirname),
    };
    res.sendFile(fileName, options, function (err) {
      if (err) {
        console.error("Error sending file:", err);
      } else {
        console.log("Sent:", fileName);
      }
    });
  } else {
    res.status(400).send(JSON.stringify({ msg: "NOT OK" }));
  }
});

// upload vendor avatar
app.post(
  "/api/upload-vendor-avatar",
  avatar.single("avatar"),
  async (req, res) => {
    const session = req.cookies.session;
    const img = req.file.path;
    const result = await uploadVendorAvatar(session, img);
    if (result) res.status(200).send(JSON.stringify({ msg: "OK" }));
    else res.status(400).send(JSON.stringify({ msg: "NOT OK" }));
  }
);

// download vendor avatar
app.post("/api/download-vendor-avatar", function (req, res) {
  const { fileName } = req.body;
  if (fileName) {
    const options = {
      root: path.join(__dirname),
    };
    res.sendFile(fileName, options, function (err) {
      if (err) {
        console.error("Error sending file:", err);
      } else {
        console.log("Sent:", fileName);
      }
    });
  } else {
    res.status(400).send(JSON.stringify({ msg: "NOT OK" }));
  }
});

app.listen(process.env.SERVER_PORT, () => {
  console.log(`
    Server is running...
    Port: ${process.env.SERVER_PORT}
    URL: http://localhost:${process.env.SERVER_PORT}/
    `);
});
