const Ticket = require("../models/ticket.model");
const validation = require("../util/validation");
const sendTicketEmail = require("../config/mail");
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

function getTicket(req, res) {
  const messages = req.flash();
  res.render("tickets/ticket", { messages: messages });
}

async function postTicket(req, res, next) {
  const title = req.body.title;
  const description = req.body.description;
  const imageFile = req.file;
  const image = imageFile ? imageFile.filename : null;
  const email = req.body.email;
  const recaptchaResponse = req.body["g-recaptcha-response"]; // Token from client
  const secretKey = process.env.CAPTCHA_SECRET; // Replace with your secret key
  const ticket = new Ticket({
    title: title,
    description: description,
    image: image,
    user_email: email,
  });

  req.session.formData = { title, description, image, email };

  // Validate input data
  if (
    !validation.checkEmail(req.body.email) ||
    validation.isEmpty(req.body.title) ||
    validation.isEmpty(req.body.description)
  ) {
    req.flash("error", "الرجاء ادخال معلومات صحيحة");
    return res.redirect("/create_ticket");
  }

  // Check if the uploaded file format is invalid
  if (!imageFile && req.fileValidationError) {
    req.flash("error", req.fileValidationError); // This will come from the multer config
    return res.redirect("/create_ticket");
  }

  try {
    // Validate reCAPTCHA
    if (!recaptchaResponse) {
      req.flash("error", "فشل التحقق الرجاء اعادة المحاولة");
      return res.redirect("/create_ticket");
    }
    // Verify reCAPTCHA with Google
    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: secretKey,
          response: recaptchaResponse,
        },
      }
    );
    const ticketId = await ticket.save();
    // Move email sending here
    await sendTicketEmail({ userEmail: req.body.email, ticketId });

    /*       if (imageFile) {
        await ticket.saveImage(ticketId);
      } */

    req.flash("success", `تم انشاء طلب بنجاح وقم الطلب هو ${ticketId}`);
    delete req.session.formData;
    return res.redirect("/ticket/inquiry");
  } catch (error) {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        req.flash("error", "اقصى الحجم المسموح به هو 2 ميغا فقط");
      }
    }

    const { success } = response.data;

    if (!success) {
      req.flash("error", "فشل التحقق الرجاء اعادة المحاولة");
      return res.redirect("/create_ticket");
    }
    next(error);
    return;
  }
}

async function getAllTickets(req, res, next) {
  let tickets;
  const email = req.session.user.email;
  try {
    tickets = await Ticket.findByEmail(email);
    res.render("tickets/ticket-list", { tickets: tickets });
  } catch (error) {
    next(error);
  }
}

function getOneTicket(req, res) {
  const messages = req.flash();
  res.render("tickets/ticket-inquiry", { messages: messages });
}

async function postOneTicket(req, res, next) {
  const { ticketId, email } = req.body;
  req.session.formData = { ticketId, email };
  let ticket;

  if (ticketId < 0) {
    req.flash("error", "الرجاء عدم ادخال رقم بالسالب");
    return res.redirect("/ticket/inquiry");
  }

  try {
    // Find ticket by ID and email
    ticket = await Ticket.findOne(ticketId, email);

    if (!ticket) {
      // If no ticket is found, display an error and redirect back to inquiry form
      req.flash("error", "لم يتم العثور على طلب او الايميل غير صحيح");
      return res.redirect("/ticket/inquiry");
    }

    // If ticket is found, redirect to the detailed view
    delete req.session.formData;
    return res.redirect(
      `/ticket-inquiry/${ticketId}?email=${encodeURIComponent(email)}`
    );
  } catch (error) {
    console.error("Error in postOneTicket:", error);
    next(error);
  }
}

async function viewTicket(req, res, next) {
  const ticketId = req.params.id; // Extract ticketId from the URL
  let ticket;
  let statuses;
  let replies;
  let adminImageUrl;
  let adminImage;

  try {
    // Find ticket by ID only, no need to check email here
    ticket = await Ticket.findOneId(ticketId); // Ensure this method exists in your model

    if (ticket.user_email !== req.session.user.email) {
      return res.status(403).render("403");
    }

    adminImage = await Ticket.getAdminImage(ticketId, 2);

    if (adminImage && adminImage.length > 0 && adminImage[0].path) {
      adminImageUrl = imageUpload.convertWindowsPathToUrl(adminImage[0].path); // Assuming the image path is in `image[0].imagePath`
    }

    if (!ticket) {
      req.flash("error", "لم يتم العثور على الطلب");
      return res.redirect("/tickets"); // Redirect if no ticket is found
    }

    statuses = await Ticket.getStatuss();
    [replies] = await Ticket.getReplyToCustomer(ticketId);
    /*    console.log("Ticket:", ticket); // Log the ticket object
    console.log("Statuses:", statuses); // Log the statuses array */

    const messages = req.flash();
    res.render("tickets/detailed-ticket", {
      ticket: ticket,
      messages: messages,
      statuses: statuses,
      replies: replies,
      adminImage: adminImageUrl,
      userId: image[0].user_id,
    });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    next(error);
  }
}

async function viewTicketInquiry(req, res, next) {
  const ticketId = req.params.id;
  const email = req.query.email; // email passed as a query parameter from postOneTicket
  let ticket, statuses, replies;
  let adminImageUrl;
  let adminImage;

  try {
    // Find ticket by ID and verify the email matches the ticket creator's email
    ticket = await Ticket.findOne(ticketId, email);

    if (!ticket) {
      req.flash("error", "تم رفض الدخول او لا يوجد طلب");
      return res.redirect("/ticket/inquiry");
    }

    adminImage = await Ticket.getAdminImage(ticketId, 2);

    if (adminImage && adminImage.length > 0 && adminImage[0].path) {
      adminImageUrl = imageUpload.convertWindowsPathToUrl(adminImage[0].path); // Assuming the image path is in `image[0].imagePath`
    }

    statuses = await Ticket.getStatuss();
    [replies] = await Ticket.getReplyToCustomer(ticketId);

    const messages = req.flash();
    res.render("tickets/detailed-ticket", {
      ticket: ticket,
      messages: messages,
      statuses: statuses,
      replies: replies,
      adminImage: adminImageUrl,
      userId: adminImage[0].user_id,
    });
  } catch (error) {
    console.error("Error in viewTicketInquiry:", error);
    next(error);
  }
}

module.exports = {
  getTicket: getTicket,
  postTicket: postTicket,
  getAllTickets: getAllTickets,
  getOneTicket: getOneTicket,
  postOneTicket: postOneTicket,
  viewTicket: viewTicket,
  viewTicketInquiry: viewTicketInquiry,
};
