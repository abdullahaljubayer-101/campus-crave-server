import nodemailer from "nodemailer";

export async function sendEmail(email, subject, content) {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "imjubayer08@gmail.com",
      pass: "xbpnnyxvpbbrwzkx",
    },
  });

  var mailOptions = {
    from: "imjubayer08@gmail.com",
    to: email,
    subject: `CampusCrave | ${subject}`,
    // text: "That was easy!",
    html: content,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}
