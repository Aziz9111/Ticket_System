const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendEmail = async ({ userEmail, ticketId }) => {
  if (!userEmail) {
    throw new Error("User email is not defined.");
  }
  return await transport.sendMail({
    from: "aziz.storage911@gmail.com",
    to: userEmail,
    subject: `Your Ticket Number is: #${ticketId}`,
    text: `Thank you for your submission! Your ticket number is: #${ticketId}.`,
  });
};

module.exports = sendEmail;
