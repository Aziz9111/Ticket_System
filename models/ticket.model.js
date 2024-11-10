const { query } = require("express");
const db = require("../data/database");
const path = require("path");
const { agent } = require("./user.model");

class Ticket {
  constructor(ticketData) {
    this.title = ticketData.title;
    this.description = ticketData.description;
    this.image = ticketData.image; // The name of image file
    this.imagePath = ticketData.image
      ? path.join(__dirname, "../../Images", ticketData.image)
      : null;
    this.imageUrl = this.image ? `/images/${ticketData.image}` : null;
    this.user_email = ticketData.user_email;
    this.status = ticketData.status_id;
    this.type = ticketData.type_id;
    this.priority = ticketData.priority;
    this.project = ticketData.project_id;
    this.reply = ticketData.reply;
    this.id = ticketData.id;
  }

  static async findAll() {
    const [data] = await db.query("SELECT * FROM ticket");
    return data.map((ticketData) => new Ticket(ticketData)); // Map through data
  }

  static async findOne(id, email) {
    const [data] = await db.query(
      "SELECT * FROM ticket WHERE id = ? and user_email = ?",
      [id, email]
    );
    if (data.length === 0) {
      return null; // Return null if no ticket is found
    }
    return new Ticket(data[0]);
  }

  static async findOneId(id) {
    const [data] = await db.query("SELECT * FROM ticket WHERE id = ?", [id]);
    if (data.length === 0) {
      return null; // Return null if no ticket is found
    }
    return new Ticket(data[0]);
  }

  async save() {
    try {
      const ticketData = [this.title, this.description, this.user_email];
      const result = await db.query(
        "INSERT INTO ticket (title, description, user_email) VALUES (?, ?, ?)",
        ticketData
      );

      // Log the entire result object to check for insertId
      /* console.log("Insert result:", result); */

      const ticketId = result[0].insertId; // Ensure you are accessing insertId correctly
      /* console.log("Inserted ticket ID:", ticketId); */ // Log the ID to confirm it's being retrieved

      // Insert the image into file_attachment with ticket_id as FK
      if (this.image) {
        await this.saveImage(ticketId); // Pass the ticketId to saveImage
      }

      return ticketId; // Return the ticketId
    } catch (error) {
      console.error("Error saving ticket:", error);
      throw error;
    }
  }

  static async adminUpdateTicket(
    ticketId,
    status_id,
    user_id,
    type_id,
    priority,
    project_id
  ) {
    const [data] = await db.query(
      "UPDATE ticket SET status_id = ?, user_id = ?, type_id = ?, priority = ?, project_id = ?, updated_at = NOW() WHERE id = ?",
      [status_id, user_id, type_id, priority, project_id, ticketId]
    );

    return [data];
  }

  static async type(typeName) {
    const [data] = await db.query("INSERT INTO type (name) VALUE (?)", [
      typeName,
    ]);
    return [data];
  }

  static async status(statusName) {
    const [data] = await db.query("INSERT INTO status (name) VALUE (?)", [
      statusName,
    ]);
    return [data];
  }

  static async replyToAgent(replyName, ticketId) {
    const [data] = await db.query(
      "INSERT INTO reply (name, reply_from, reply_to, ticket_id) VALUES (?, 'admin', 'agent', ?)",
      [replyName, ticketId]
    );
    const replyId = data.insertId;
    return { data, replyId };
  }

  static async replyToAdmin(replyName, ticketId) {
    const [data] = await db.query(
      "INSERT INTO reply (name, reply_from, reply_to, ticket_id) VALUES (?, 'agent', 'admin', ?)",
      [replyName, ticketId]
    );
    const replyId = data.insertId;
    return { data, replyId };
  }

  static async replyToCustomer(replyName, ticketId) {
    const [data] = await db.query(
      "INSERT INTO reply (name, reply_from, reply_to, ticket_id) VALUES (?, 'admin', 'customer', ?)",
      [replyName, ticketId]
    );
    const replyId = data.insertId;
    return [data, replyId];
  }

  static async assignAgent(ticketId, agentId, replyId) {
    const [assign] = await db.query(
      "INSERT INTO assignment (ticket_id, agent_id, reply_id) VALUES (?, ?, ?)",
      [ticketId, agentId, replyId]
    );
    return [assign];
  }

  static async getExistingAssignment(ticket_id, agent_id) {
    const [data] = await db.query(
      "SELECT * FROM assignment WHERE ticket_id = ? AND agent_id = ?",
      [ticket_id, agent_id]
    );
    return [data];
  }

  static async agentTickets(agentId) {
    const [data] = await db.query(
      "SELECT * FROM assignment INNER JOIN ticket ON ticket.id = assignment.ticket_id WHERE agent_id = ?",
      [agentId]
    );
    return data.map((ticketData) => new Ticket(ticketData));
  }

  static async existingAssignment(ticket_id, agent_id) {
    const [data] = await db.query(
      "SELECT * FROM assignment WHERE ticket_id = ? AND agent_id = ?",
      [ticket_id, agent_id]
    );
    return data.length > 0;
  }
  static async getReplyToAdmin(ticketId) {
    const [data] = await db.query(
      "SELECT * FROM reply WHERE ticket_id = ? and reply_to = 'admin'",
      [ticketId]
    );
    return [data];
  }

  static async getReplyToAgent(ticketId) {
    const [data] = await db.query(
      "SELECT * FROM reply WHERE ticket_id = ? and reply_to = 'agent'",
      [ticketId]
    );
    return [data];
  }

  static async getReplyToCustomer(ticketId) {
    const [data] = await db.query(
      "SELECT * FROM reply WHERE ticket_id = ? and reply_to = 'customer'",
      [ticketId]
    );
    return [data];
  }

  static async getType() {
    const [type] = await db.query("SELECT * FROM type");
    return [type];
  }

  static async getStatuss() {
    const [status] = await db.query("SELECT * FROM status");
    return [status];
  }

  static async getProject() {
    const [project] = await db.query("SELECT * FROM project");
    return [project];
  }

  static async getReply() {
    const [reply] = await db.query("SELECT * FROM reply");
    return [reply];
  }

  static async getImage(ticketId) {
    const [image] = await db.query(
      "SELECT * FROM file_attachment WHERE ticket_id = ?",
      [ticketId]
    );
    return image;
  }

  static async getAdminImage(ticketId, userId) {
    const [image] = await db.query(
      "SELECT * FROM file_attachment WHERE ticket_id = ? AND user_id = ?",
      [ticketId, userId]
    );
    return image;
  }

  static async project(projectName, projectDescription) {
    const [data] = await db.query(
      "INSERT INTO project (name, description) VALUES (?, ?)",
      [projectName, projectDescription]
    );
    return [data];
  }

  static async sendTicket(ticketId, agent_id, reply_id) {
    const [data] = await db.query(
      "INSERT INTO assignment (ticket_id, agent_id, reply_id) VALUES (?, ?, ?)",
      [ticketId, agent_id, reply_id]
    );

    return [data];
  }

  async saveImage(ticketId) {
    const imagePath = this.imagePath;
    try {
      // Insert the image path with the correct ticket_id
      await db.query(
        "INSERT INTO file_attachment (path, ticket_id) VALUES (?, ?)",
        [imagePath, ticketId]
      );
    } catch (error) {
      console.error("Error saving image:", error);
    }
  }

  static async imageSave(path, ticketId, userId) {
    try {
      // Insert the image path with the correct ticket_id
      await db.query(
        "INSERT INTO file_attachment (path, ticket_id, user_id) VALUES (?, ?, ?)",
        [path, ticketId, userId]
      );
    } catch (error) {
      console.error("Error saving image:", error);
    }
  }
}

module.exports = Ticket;
