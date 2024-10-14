const Ticket = require("../models/ticket.model");

async function getAllTickets(req,res, next) {
    let tickets;
    try {
      tickets = await Ticket.findAll();
      res.render("agent/ticket-list", {tickets: tickets});  
    } catch (error) {
      next(error)
    }
  }

  async function viewTicket(req,res, next) {
    const ticketId = req.params.id;  // Extract ticketId from the URL
    let ticket;
    
    try {
      // Find ticket by ID only, no need to check email here
      ticket = await Ticket.findOneId(ticketId);  // Ensure this method exists in your model
      if (!ticket) {
        req.flash("error", "Ticket not found.");
        return res.redirect("/tickets");  // Redirect if no ticket is found
      }
      const messages = req.flash();
      res.render("agent/update-ticket", { ticket: ticket, messages: messages });
    } catch (error) {
      console.error("Error fetching ticket:", error);
      next(error);
    }
  }



module.exports = {
    getAllTickets: getAllTickets, 
    viewTicket: viewTicket,
}