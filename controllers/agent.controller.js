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
    
    let projects;
    let types;
    let statuses;

    try {
      // Find ticket by ID only, no need to check email here
      ticket = await Ticket.findOneId(ticketId);  
      if (!ticket) {
        req.flash("error", "Ticket not found.");
        return res.redirect("/tickets");  // Redirect if no ticket is found
      }

      statuses = await Ticket.getStatuss();
      projects = await Ticket.getProject();
      types = await Ticket.getType();

      const messages = req.flash();
      res.render("agent/update-ticket", { 
        ticket: ticket,
        messages: messages,
        projects: projects,
        types: types, 
        statuses: statuses
      });
    } catch (error) {
      console.error("Error fetching ticket:", error);
      next(error);
    }
  }

  async function updateTicket(req, res, next) {
    const ticketId = req.params.id;  // Get the ticket ID from the route parameter
    const status = req.body.status;  // Extract status and reply from the form data
    const reply = req.body.reply
  
    try {
      // Call the model's update method
      await Ticket.agentUpdateTicket(ticketId, status, reply);
      
      req.flash("success", "Ticket updated successfully.");
      return res.redirect(`/agent/ticket/${ticketId}`);
    } catch (error) {
      console.error("Error updating ticket:", error);
      next(error);
    }
  }

  async function getSendTicket(req,res) {
    const ticketId = req.params.id; 

    let ticket;
    try {
      ticket = await Ticket.findOneId(ticketId);  
      if (!ticket) {
        req.flash("error", "Ticket not found.");
        return res.redirect("/tickets");  // Redirect if no ticket is found
      }
    } catch (error) {
      
    }
    const messages = req.flash();
    res.render("agent/send-ticket", {messages: messages, ticket: ticket});
  }

  async function postSendTicket(req, res, next) {
    const notes = req.body.notes;
    const ticketId = req.params.id;

    try {
      // Assuming you want to send some notification or update the ticket in some way
      await Ticket.sendTicket(ticketId, 3, notes); 

      req.flash("success", "Ticket sent successfully.");
      return res.redirect(`/agent/ticket/${ticketId}`);
    } catch (error) {
      console.error("Error sending ticket:", error);
      req.flash("error", "Failed to send ticket.");
      next(error);
    }
}
  


module.exports = {
    getAllTickets: getAllTickets, 
    viewTicket: viewTicket,
    updateTicket: updateTicket,
    getSendTicket: getSendTicket,
    postSendTicket: postSendTicket,
}