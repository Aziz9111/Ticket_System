const Ticket = require("../models/ticket.model");
const validation = require("../util/validation");
const sendTicketEmail = require("../config/mail");


function getTicket(req, res) {
  const messages = req.flash();
    res.render("tickets/ticket", {messages: messages});
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
      await sendTicketEmail({userEmail: req.body.email, ticketId});
  
      if (imageFile) {
        await ticket.saveImage(ticketId);
      }
  
      req.flash("success", "Ticket Created");
      return res.redirect("/tickets");
    } catch (error) {
      next(error);
      return;
    }
  }

async function getAllTickets(req,res, next) {
  let tickets;
  try {
    tickets = await Ticket.findAll();
    res.render("tickets/ticket-list", {tickets: tickets});  
  } catch (error) {
    next(error)
  }
}

async function getOneTicket(req,res, next) {
  const id = req.params.id;
  let tickets;
  try {
    tickets = await Ticket.findById(id);
    res.render("tickets/ticket-list", {tickets: tickets});  
  } catch (error) {
    next(error)
  }
}
module.exports = {
    getTicket: getTicket,
    postTicket: postTicket,
    getAllTickets: getAllTickets,
    getOneTicket: getOneTicket,
}