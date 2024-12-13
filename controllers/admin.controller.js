const session = require("express-session");
const Ticket = require("../models/ticket.model");
const User = require("../models/user.model");
const imageUpload = require("../util/upload-images");
const path = require("path");

async function getAllTickets(req, res, next) {
  let tickets;
  try {
    tickets = await Ticket.findAll();
    res.render("admin/ticket-list", {
      tickets: tickets,
    });
  } catch (error) {
    next(error);
  }
}

async function search(req, res, next) {
  const searchQuery = req.query.query || ""; // Default to empty string if no query

  if (!searchQuery.trim()) {
    // If no valid search query, redirect to the tickets list page
    return res.redirect("/admin/tickets");
  }

  try {
    // Call the Ticket model's searchAll method to get the results
    const tickets = await Ticket.searchAll(searchQuery);

    // Render the result with the tickets
    res.render("admin/ticket-list", { tickets });
  } catch (err) {
    // Catch any errors and pass them to the error handler
    console.error(err);
    next(err);
  }
}

async function viewTicket(req, res, next) {
  const ticketId = req.params.id; // Extract ticketId from the URL
  let ticket;
  let statuses;
  let types;
  let projects;
  let replies;
  let adminReplies;
  let imageUrl;

  try {
    // Find ticket by ID only, no need to check email here
    ticket = await Ticket.findOneId(ticketId); // Ensure this method exists in your model
    if (!ticket) {
      req.flash("error", "Ticket not found.");
      return res.redirect("/tickets"); // Redirect if no ticket is found
    }

    // Fetch all possible statuses, types, and projects
    statuses = await Ticket.getStatuss();
    types = await Ticket.getType();
    projects = await Ticket.getProject();

    [replies] = await Ticket.getReplyToAdmin(ticketId);
    [adminReplies] = await Ticket.getReplyToAgent(ticketId);

    const allReplies = [...replies, ...adminReplies].sort(
      (a, b) => a.id - b.id
    );

    const image = await Ticket.getImage(ticketId);

    //console.log("image: ", image);

    if (image && image.length > 0 && image[0].path) {
      imageUrl = imageUpload.convertWindowsPathToUrl(image[0].path); // Assuming the image path is in `image[0].imagePath`
    }
    //console.log("imageURL", imageUrl);
    const messages = req.flash();

    res.render("admin/update-ticket", {
      ticket: ticket,
      messages: messages,
      statuses: statuses[0],
      types: types[0],
      projects: projects[0],
      image: imageUrl,
      replies: allReplies,
      messages: messages,
    });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    next(error);
  }
}

async function updateTicket(req, res, next) {
  const id = req.params.id;
  const priority = req.body.priority;
  const status_id = req.body.status;
  const type_id = req.body.type;
  const project_id = req.body.project;
  let ticket;
  let user;
  let userId;

  try {
    ticket = await Ticket.findOneId(id); // Ensure this method exists in your model
    if (!ticket) {
      req.flash("error", "Ticket not found.");
      return res.redirect("/tickets"); // Redirect if no ticket is found
    }
    const userEmail = ticket.user_email;

    user = await User.getUserByEmail(userEmail); // Assuming this method returns the user object or null
    userId = user ? user.id : null;

    await Ticket.adminUpdateTicket(
      id,
      status_id,
      userId,
      type_id,
      priority,
      project_id
    );
    req.flash("success", "Ticket Updated Successfully");
    return res.redirect(`/admin/ticket/${id}`);
  } catch (error) {
    next(error);
  }
}

function getTicketType(req, res) {
  const messages = req.flash();
  res.render("admin/ticket-type", { messages: messages });
}

function getTicketProject(req, res) {
  const messages = req.flash();
  res.render("admin/ticket-project", { messages: messages });
}

function getTicketStatus(req, res) {
  const messages = req.flash();
  res.render("admin/ticket-status", { messages: messages });
}

async function postTicketType(req, res, next) {
  const type = req.body.type;

  try {
    if (type) {
      await Ticket.type(type);
      req.flash("success", "Type Added Successfully");
      return res.redirect("/admin/ticket-type");
    }
  } catch (error) {
    next();
    return;
  }
}

async function postTicketStatus(req, res, next) {
  const status = req.body.status;

  try {
    if (status) {
      await Ticket.status(status);
      req.flash("success", "Status Added Successfully");
      return res.redirect("/admin/ticket-status");
    }
  } catch (error) {
    next();
    return;
  }
}

async function postTicketProject(req, res, next) {
  const project = req.body.project;
  const description = req.body.description;

  try {
    if (project && description) {
      await Ticket.project(project, description);
      req.flash("success", "Project Added Successfully");
      return res.redirect("/admin/ticket-project");
    }
  } catch (error) {
    next();
    return;
  }
}

async function getAssignTicket(req, res) {
  const ticketId = req.params.id;
  let ticket;
  let agent;
  try {
    ticket = await Ticket.findOneId(ticketId);
    if (!ticket) {
      req.flash("error", "Ticket not found.");
      return res.redirect("/tickets"); // Redirect if no ticket is found
    }

    agent = await User.agent();
  } catch (error) {}
  const messages = req.flash();
  res.render("admin/assign-ticket", {
    messages: messages,
    ticket: ticket,
    agent: agent[0],
  });
}

async function postAssignTicket(req, res, next) {
  const replyToAgent = req.body.replyToAgent;
  const replyToCustomer = req.body.replyToCustomer;
  const ticketId = req.params.id;
  const agent = req.body.agent;
  let replyData;
  let replyId;

  try {
    // Admin reply to agent
    // Process reply to agent if provided
    if (replyToAgent && agent) {
      replyData = await Ticket.replyToAgent(replyToAgent, ticketId);
      replyId = replyData.replyId; // Set replyId for the agent
    }

    if (!agent) {
      req.flash("erorr", "لا يوجد عملاء للان");
      return res.redirect(`/admin/assign-ticket/${ticketId}`);
    }

    // Process reply to customer if provided
    if (replyToCustomer) {
      replyData = await Ticket.replyToCustomer(replyToCustomer, ticketId);
      req.flash("success", "تم الارسال بنجاح");
      return res.redirect(`/admin/assign-ticket/${ticketId}`);
    }

    const [existingAssignment] = await Ticket.getExistingAssignment(
      ticketId,
      agent
    );

    if (!existingAssignment || existingAssignment.length === 0) {
      await Ticket.assignAgent(ticketId, agent, replyId);
    }

    if (req.file && req.file.filename) {
      const imagePath = path.join(
        __dirname,
        "public/Images",
        req.file.filename
      );
      await Ticket.imageSave(imagePath, ticketId, req.session.user.id);
    }

    req.flash("success", "تم الارسال بنجاح");
    return res.redirect(`/admin/assign-ticket/${ticketId}`);
  } catch (error) {
    req.flash("error", "فشل الارسال");
    return res.redirect(`/admin/assign-ticket/${ticketId}`);
  }
}

async function dashboard(req, res) {
  try {
    const allUsers = (await Ticket.totalCreatedTicketUsers())[0].total_users;
    const newUsers = (await Ticket.newUsersLastMonth())[0].new_users_last_month;
    const allTickets = (await Ticket.totalCreatedTickets())[0].total_tickets;
    const newTickets = (await Ticket.newTicketsLastMonth())[0]
      .new_tickets_last_month;
    res.render("admin/dashboard/index", {
      allUsers,
      newUsers,
      allTickets,
      newTickets,
    });
  } catch (error) {}
}

async function chartsData(req, res) {
  try {
    const statusCounts = await Ticket.getStatusCounts();
    const typeCounts = await Ticket.getTypesCounts();
    const projectCounts = await Ticket.getProjectsCounts();
    const userCounts = await Ticket.getUsersCounts();

    // Transform data into the format required for the chart
    const chartData = statusCounts.map((status) => ({
      label: status.name,
      data: status.count,
    }));

    const typeData = typeCounts.map((type) => ({
      label: type.name,
      data: type.count,
    }));

    const projectData = projectCounts.map((project) => ({
      label: project.name,
      data: project.count,
    }));

    const userData = userCounts.map((user) => ({
      label: user.user_email,
      data: user.count,
    }));

    const allChartData = {
      chartData,
      typeData,
      projectData,
      userData,
    };

    // Send the chart data as JSON
    res.json(allChartData); // Send the chart data as JSON
  } catch (error) {
    console.error("Error fetching chart data:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function charts(req, res) {
  try {
    // Fetch ticket status counts
    const statusCounts = await Ticket.getStatusCounts();
    const typeCounts = await Ticket.getTypesCounts();
    const projectCounts = await Ticket.getProjectsCounts();
    const userCounts = await Ticket.getUsersCounts();

    // Transform data into the format required for the chart
    const chartData = statusCounts.map((status) => ({
      label: status.name,
      data: status.count,
    }));

    const typeData = typeCounts.map((type) => ({
      label: type.name,
      data: type.count,
    }));

    const projectData = projectCounts.map((project) => ({
      label: project.name,
      data: project.count,
    }));

    const userData = userCounts.map((user) => ({
      label: user.user_email,
      data: user.count,
    }));
    // Pass data to the template
    res.render("admin/dashboard/charts", {
      chartData,
      typeData,
      userData,
      projectData,
    });
  } catch (error) {
    console.error("Error fetching chart data:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function tables(req, res) {
  try {
    // Fetch ticket status counts
    const userCounts = await Ticket.getUsersCounts();
    // Fetch all tickets in last month
    const ticketsLastMonth = await Ticket.ticketsLastMonth();

    // Pass data to the template
    res.render("admin/dashboard/tables", {
      userData: userCounts,
      newTickets: ticketsLastMonth,
    });
  } catch (error) {
    console.error("Error fetching chart data:", error);
    res.status(500).send("Internal Server Error");
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
  getTicketStatus: getTicketStatus,
  postTicketStatus: postTicketStatus,
  getAssignTicket: getAssignTicket,
  postAssignTicket: postAssignTicket,
  dashboard: dashboard,
  tables: tables,
  charts: charts,
  chartsData: chartsData,
  search: search,
};
