const db = require("../data/database");

class Ticket {
  constructor(ticketData) {
    this.title = ticketData.title;
    this.description = ticketData.description;    
    this.user_email = ticketData.user_email;
  }

  static async findAll() {
    const [rows] = await db.query("SELECT title, description, user_email FROM ticket");
    return rows.map((ticketData) => new Ticket(ticketData)); // Map through rows
  }

  async save() {
    const ticketData = [this.title, this.description, this.user_email];
    await db.query("INSERT INTO ticket (title, description, user_email) VALUES (?, ?, ?) ", ticketData);
  }
}

module.exports = Ticket;