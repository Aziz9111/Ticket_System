const Ticket = require("../models/ticket.model");

function getTicket(req, res) {
    res.render("tickets/ticket");
  }

async function postTicket(req, res, next) {
    const ticket = new Ticket({
      title: req.body.title,
      description: req.body.description,
      user_email: req.body.email
    });
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