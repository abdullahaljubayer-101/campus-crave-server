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
  getSearchVendor,
} from "./database/vendor.js";
import {
  createProduct,
  getAllProductVendor,
  getProductVendor,
  getCategory,
  updateAvailable,
  deleteProduct,
  getAllProduct,
  getSearchProduct,
  getProduct,
  getCategoryProduct,
  getVendorProduct,
  getPriceProduct,
} from "./database/product.js";
import {
  getAllCustomer,
  getSearchCustomer,
  getCustomer,
  addToCart,
  getToCart,
  confirmOrder,
  getOrder,
  countOrder,
  countCustomer,
  countVendor,
  getOrderAAA,
} from "./database/customer.js";
import { sendEmail } from "./helper/email.js";
import { getOTP } from "./helper/helper.js";
import { compareSync } from "bcrypt";

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

let productStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/product");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "." + file.mimetype.split("/")[1]);
  },
});
const product = multer({ storage: productStorage });

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

app.get("/api/count/order", async (req, res) => {
  const result = await countOrder();
  if (result) res.status(200).send(JSON.stringify(result));
  else res.status(400).send(JSON.stringify({ msg: "NO PRODUCT" }));
});

app.get("/api/count/customer", async (req, res) => {
  const result = await countCustomer();
  if (result) res.status(200).send(JSON.stringify(result));
  else res.status(400).send(JSON.stringify({ msg: "NO PRODUCT" }));
});

app.get("/api/count/vendor", async (req, res) => {
  const result = await countVendor();
  if (result) res.status(200).send(JSON.stringify(result));
  else res.status(400).send(JSON.stringify({ msg: "NO PRODUCT" }));
});

// ---------------------- >customer ---------------------- //
// >get all customer
app.get("/api/customer", async (req, res) => {
  const customer = await getAllCustomer();
  if (customer) res.status(200).send(JSON.stringify(customer));
  else res.status(400).send(JSON.stringify({ msg: "NO CUSTOMER" }));
});

// >get a customer
app.get("/api/customer/:id", async (req, res) => {
  const id = req.params.id;
  const customer = await getCustomer(id);
  if (customer) res.status(200).send(JSON.stringify(customer));
  else res.status(400).send(JSON.stringify({ msg: "NO PRODUCT" }));
});

// >get search customer
app.get("/api/customer/search/:key", async (req, res) => {
  const key = req.params.key;
  const customer = await getSearchCustomer(key);
  if (customer) res.status(200).send(JSON.stringify(customer));
  else res.status(400).send(JSON.stringify({ msg: "NO PRODUCT" }));
});

// >add to cart
app.post("/api/customer/cart", async (req, res) => {
  const { productID, quantity } = req.body;
  const session = req.cookies.session;
  const result = await addToCart(session, productID, quantity);
  if (result) res.status(200).send(JSON.stringify({ msg: "OK" }));
  else res.status(400).send(JSON.stringify({ msg: "NOT OK" }));
});

// >get to cart
app.get("/api/customers/cart", async (req, res) => {
  const session = req.cookies.session;
  const result = await getToCart(session);
  if (result) res.status(200).send(JSON.stringify(result));
  else res.status(400).send(JSON.stringify({ msg: "NOT OK" }));
});

// >confirm order
app.get("/api/customers/confirm-order", async (req, res) => {
  const session = req.cookies.session;
  const result = await confirmOrder(session);
  if (result) res.status(200).send(JSON.stringify(result));
  else res.status(400).send(JSON.stringify({ msg: "NOT OK" }));
});

// >get order
app.get("/api/customers/order", async (req, res) => {
  const result = await getOrder();
  if (result) res.status(200).send(JSON.stringify(result));
  else res.status(400).send(JSON.stringify({ msg: "NOT OK" }));
});

// >get order vendor
app.get("/api/customers/order/aaa", async (req, res) => {
  const result = await getOrderAAA();
  if (result) res.status(200).send(JSON.stringify(result));
  else res.status(400).send(JSON.stringify({ msg: "NOT OK" }));
});

// ---------------------- >product ---------------------- //
// >product create
app.post("/api/product/create", async (req, res) => {
  const { name, description, price, img, categorys } = req.body;
  const session = req.cookies.session;
  const result = await createProduct(
    session,
    name,
    description,
    price,
    img,
    categorys
  );
  if (result) res.status(200).send(JSON.stringify({ msg: "OK" }));
  else res.status(400).send(JSON.stringify({ msg: "NOT OK" }));
});

// >get all product
app.get("/api/product", async (req, res) => {
  const product = await getAllProduct();
  if (product) res.status(200).send(JSON.stringify(product));
  else res.status(400).send(JSON.stringify({ msg: "NO PRODUCT" }));
});

// >get a product
app.get("/api/product/:id", async (req, res) => {
  const id = req.params.id;
  const product = await getProduct(id);
  if (product) res.status(200).send(JSON.stringify(product));
  else res.status(400).send(JSON.stringify({ msg: "NO PRODUCT" }));
});

// >get search product
app.get("/api/product/search/:key", async (req, res) => {
  const key = req.params.key;
  const product = await getSearchProduct(key);
  if (product) res.status(200).send(JSON.stringify(product));
  else res.status(400).send(JSON.stringify({ msg: "NO PRODUCT" }));
});

// >get categorys product
app.get("/api/product/categorys/:category", async (req, res) => {
  const category = req.params.category;
  const product = await getCategoryProduct(category);
  if (product) res.status(200).send(JSON.stringify(product));
  else res.status(400).send(JSON.stringify({ msg: "NO PRODUCT" }));
});

// >get categorys product
app.get("/api/product/vendors/:vendor", async (req, res) => {
  const vendor = req.params.vendor;
  const product = await getVendorProduct(vendor);
  if (product) res.status(200).send(JSON.stringify(product));
  else res.status(400).send(JSON.stringify({ msg: "NO PRODUCT" }));
});

// >get categorys product
app.get("/api/product/price/:min&:max", async (req, res) => {
  const min = req.params.min;
  const max = req.params.max;
  const product = await getPriceProduct(min, max);
  if (product) res.status(200).send(JSON.stringify(product));
  else res.status(400).send(JSON.stringify({ msg: "NO PRODUCT" }));
});

// get all product vendor
app.get("/api/products/vendor/:id", async (req, res) => {
  const id = req.params.id;
  const product = await getAllProductVendor(id);
  if (product) res.status(200).send(JSON.stringify(product));
  else res.status(400).send(JSON.stringify({ msg: "NO PRODUCT" }));
});

// get a product vendor
app.get("/api/product/vendor/:id", async (req, res) => {
  const id = req.params.id;
  const product = await getProductVendor(id);
  if (product) res.status(200).send(JSON.stringify(product));
  else res.status(400).send(JSON.stringify({ msg: "NO PRODUCT" }));
});

// get category
app.get("/api/product/category/:id", async (req, res) => {
  const id = req.params.id;
  const category = await getCategory(id);
  if (category) res.status(200).send(JSON.stringify(category));
  else res.status(400).send(JSON.stringify({ msg: "NO CATEGORY" }));
});

// update available
app.get("/api/product/available/:id", async (req, res) => {
  const id = req.params.id;
  const available = await updateAvailable(id);
  if (available) res.status(200).send(JSON.stringify({ msg: "OK" }));
  else res.status(400).send(JSON.stringify({ msg: "NOT OK" }));
});

// delete product
app.get("/api/product/delete/:id", async (req, res) => {
  const id = req.params.id;
  const result = await deleteProduct(id);
  if (result) res.status(200).send(JSON.stringify({ msg: "OK" }));
  else res.status(400).send(JSON.stringify({ msg: "NOT OK" }));
});

// >product upload
app.post("/api/upload-product", product.single("avatar"), async (req, res) => {
  const img = req.file.path;
  if (img) res.status(200).send(JSON.stringify({ img: img }));
  else res.status(400).send(JSON.stringify({ msg: "NOT OK" }));
});

// >product download
app.post("/api/download-product", function (req, res) {
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

// ---------------------- >vendor ---------------------- //
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

// get search vendor
app.get("/api/vendor/search/:key", async (req, res) => {
  const key = req.params.key;
  const vendor = await getSearchVendor(key);
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

// ---------------------- >auth ---------------------- //
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
