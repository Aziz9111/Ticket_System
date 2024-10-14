const { query } = require("express");
const db = require("../data/database");
const path = require("path");

class Ticket {
  constructor(ticketData) {
    this.title = ticketData.title;
    this.description = ticketData.description;
    this.image = ticketData.image; // The name of image file
    this.imagePath = ticketData.image ? path.join(__dirname, '../../Images', ticketData.image) : null; 
    this.imageUrl = this.image ? `/images/${ticketData.image}` : null;
    this.user_email = ticketData.user_email;
    this.status = ticketData.status;
    this.type = ticketData.type;
    this.priority = ticketData.priority;
    this.project = ticketData.project;
    this.reply = ticketData.reply;
    this.id = ticketData.id;
  }

  static async findAll() {
    const [data] = await db.query("SELECT * FROM ticket");
    return data.map((ticketData) => new Ticket(ticketData)); // Map through data
  }

  static async findOne(id, email) {
    const [data] = await db.query("SELECT * FROM ticket WHERE id = ? and user_email = ?", [id, email]);
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
      const result = await db.query("INSERT INTO ticket (title, description, user_email) VALUES (?, ?, ?)", ticketData);
  
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

  static async adminUpdateTicket(ticketId, priority, reply) {
    const [data] = await db.query(
      "UPDATE ticket SET priority = ?, reply = ? WHERE id = ?", 
      [priority, reply, ticketId]);

    return [data];
  }

  static async type(typeName) {
    const [data] = await db.query(
      "INSERT INTO type (name) VALUE (?)",
      [typeName]
    );
    return [data];
  }

  static async project(projectName, projectDescription) {
    const [data] = await  db.query(
      "INSERT INTO project (name, description) VALUES (?, ?)",
      [projectName, projectDescription]
    );
    return [data];
  }

  static async agentUpdateTicket(ticketId, status, reply) {
    const [data] = await db.query(
      "UPDATE ticket SET status = ?, reply = ? WHERE id = ?", 
      [status, reply, ticketId]);

    return [data];
  }
  
  
  async saveImage(ticketId) {
    const imagePath = this.imagePath;
    try {
      // Insert the image path with the correct ticket_id
      await db.query("INSERT INTO file_attachment (path, ticket_id) VALUES (?, ?)", [imagePath, ticketId]);
    } catch (error) {
      console.error("Error saving image:", error);
    }
  }
}

module.exports = Ticket;