const Ticket = require("../models/ticket.model");
const validation = require("../util/validation");

function getTicket(req, res) {
  const messages = req.flash();
    res.render("tickets/ticket", {messages: messages});
  }

async function postTicket(req, res, next) {
    const ticket = new Ticket({
      title: req.body.title,
      description: req.body.description,
      user_email: req.body.email
    });
    if (!validation.checkEmail(req.body.email) || validation.isEmpty(req.body.title) || 
    validation.isEmpty(req.body.description)) {
      req.flash("error", "Please Enter Valid Data");
      return res.redirect("/create_ticket")
    }
    try {
      await ticket.save();
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
module.exports = {
    getTicket: getTicket,
    postTicket: postTicket,
    getAllTickets: getAllTickets,
}