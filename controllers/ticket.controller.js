const Ticket = require("../models/ticket.model");
const validation = require("../util/validation");
const sendTicketEmail = require("../config/mail");

function getTicket(req, res) {
  const messages = req.flash();
  res.render("tickets/ticket", { messages: messages });
}

async function postTicket(req, res, next) {
  const imageFile = req.file;
  const ticket = new Ticket({
    title: req.body.title,
    description: req.body.description,
    image: imageFile ? imageFile.filename : null,
    user_email: req.body.email,
  });

  // Validate input data
  if (
    !validation.checkEmail(req.body.email) ||
    validation.isEmpty(req.body.title) ||
    validation.isEmpty(req.body.description)
  ) {
    req.flash("error", "Please Enter Valid Data");
    return res.redirect("/create_ticket");
  }

  try {
    const ticketId = await ticket.save();
    // Move email sending here
    await sendTicketEmail({ userEmail: req.body.email, ticketId });

    /*       if (imageFile) {
        await ticket.saveImage(ticketId);
      } */

    req.flash("success", "Ticket Created");
    return res.redirect("/ticket/inquiry");
  } catch (error) {
    next(error);
    return;
  }
}

async function getAllTickets(req, res, next) {
  let tickets;
  try {
    tickets = await Ticket.findAll();
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
  let ticket;

  try {
    // Find ticket by ID and email
    ticket = await Ticket.findOne(ticketId, email);

    if (!ticket) {
      // If no ticket is found, display an error and redirect back to inquiry form
      req.flash("error", "Ticket not found or email does not match.");
      return res.redirect("/ticket/inquiry");
    }

    // If ticket is found, redirect to the detailed view
    return res.redirect(`/ticket/${ticketId}`);
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
  let userEmail;

  try {
    // Find ticket by ID only, no need to check email here
    ticket = await Ticket.findOneId(ticketId); // Ensure this method exists in your model

    if (ticket.user_email !== req.session.user.email) {
      return res.status(403).render("403");
    }

    if (!ticket) {
      req.flash("error", "Ticket not found.");
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
    });
  } catch (error) {
    console.error("Error fetching ticket:", error);
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
};
