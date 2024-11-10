const Ticket = require("../models/ticket.model");
const imageUpload = require("../util/upload-images");

async function getAllTickets(req, res, next) {
  let tickets;
  const agent = req.session.user.id;
  try {
    tickets = await Ticket.agentTickets(agent);

    res.render("agent/ticket-list", { tickets: tickets });
  } catch (error) {
    next(error);
  }
}

async function viewTicket(req, res, next) {
  const ticketId = req.params.id; // Extract ticketId from the URL
  let ticket;
  let projects;
  let types;
  let statuses;
  let image;
  let replies;
  let imageUrl;
  let adminImage;
  let adminImageUrl;

  try {
    // Find ticket by ID only, no need to check email here
    ticket = await Ticket.findOneId(ticketId);
    if (!ticket) {
      req.flash("error", "Ticket not found.");
      return res.redirect("/tickets"); // Redirect if no ticket is found
    }
    const agentId = req.session.user.id; // Get the logged-in agent's ID

    // Check if the agent is assigned to the ticket
    const isAssigned = await Ticket.existingAssignment(ticketId, agentId);
    if (!isAssigned) {
      req.flash("error", "You do not have access to this ticket.");
      return res.status(403).render("401"); // Access denied if not assigned
    }

    statuses = await Ticket.getStatuss();
    projects = await Ticket.getProject();
    types = await Ticket.getType();

    image = await Ticket.getImage(ticketId);

    if (image && image.length > 0 && image[0].path) {
      imageUrl = imageUpload.convertWindowsPathToUrl(image[0].path); // Assuming the image path is in `image[0].imagePath`
    }

    adminImage = await Ticket.getAdminImage(ticketId, 4);

    if (adminImage && adminImage.length > 0 && adminImage[0].path) {
      adminImageUrl = imageUpload.convertWindowsPathToUrl(adminImage[0].path); // Assuming the image path is in `image[0].imagePath`
    }

    [replies] = await Ticket.getReplyToAgent(ticketId);

    const messages = req.flash();
    res.render("agent/update-ticket", {
      ticket: ticket,
      messages: messages,
      projects: projects,
      types: types,
      statuses: statuses,
      replies: replies,
      image: imageUrl,
      adminImage: adminImageUrl,
      userId: image[0].user_id,
    });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    next(error);
  }
}

async function updateTicket(req, res, next) {
  const ticketId = req.params.id; // Get the ticket ID from the route parameter
  const reply = req.body.reply;

  try {
    // Call the model's update method
    await Ticket.replyToAdmin(reply, ticketId);

    req.flash("success", "Your reply was sent successfully.");
    return res.redirect(`/agent/ticket/${ticketId}`);
  } catch (error) {
    console.error("Error updating ticket:", error);
    next(error);
  }
}

async function getSendTicket(req, res) {
  const ticketId = req.params.id;

  let ticket;
  try {
    ticket = await Ticket.findOneId(ticketId);
    if (!ticket) {
      req.flash("error", "Ticket not found.");
      return res.redirect("/tickets"); // Redirect if no ticket is found
    }
  } catch (error) {}
  const messages = req.flash();
  res.render("agent/send-ticket", { messages: messages, ticket: ticket });
}

async function postSendTicket(req, res, next) {
  const notes = req.body.notes;
  const ticketId = req.params.id;

  try {
    // Assuming you want to send some notification or update the ticket in some way
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
};
