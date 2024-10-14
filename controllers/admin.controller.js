const Ticket = require("../models/ticket.model");

async function getAllTickets(req,res, next) {
    let tickets;
    try {
      tickets = await Ticket.findAll();
      res.render("admin/ticket-list", {tickets: tickets});  
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
      res.render("admin/update-ticket", { ticket: ticket, messages: messages });
    } catch (error) {
      console.error("Error fetching ticket:", error);
      next(error);
    }
  }

  async function updateTicket(req, res, next) {
    const id = req.params.id;
    const priority = req.body.priority;
    const reply = req.body.reply;
  
    try {
        await Ticket.adminUpdateTicket(id, priority, reply);

        res.redirect(`/admin/ticket/${id}`);
    } catch (error) {
        next(error);
    }
}

function getTicketType(req, res) {
  const messages = req.flash();
    res.render("admin/ticket-type", {messages: messages});
}

function getTicketProject(req, res) {
  const messages = req.flash();
    res.render("admin/ticket-project", {messages: messages});
}

async function postTicketType(req, res, next) {
  const type = req.body.type;

  try {
    if (type) {
      await Ticket.type(type);
      req.flash("success", "Type Added Successfully");
      return res.redirect("/admin/ticket-type")
    }
  } catch (error) {
    next()
    return
  }
}

async function postTicketProject(req, res, next) {
  const project = req.body.project;
  const description = req.body.description;

  try {
    if (project && description) {
      await Ticket.project(project, description);
      req.flash("success", "Project Added Successfully");
      return res.redirect("/admin/ticket-project")
    }
  } catch (error) {
    next()
    return
  }
}

module.exports = {
    getAllTickets: getAllTickets,
    viewTicket: viewTicket,
    updateTicket: updateTicket,
    getTicketType: getTicketType,
    getTicketProject: getTicketProject, 
    postTicketProject: postTicketProject,
    postTicketType: postTicketType,
}