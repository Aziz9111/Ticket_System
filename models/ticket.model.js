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
  }

  static async findAll() {
    const [data] = await db.query("SELECT title, description, user_email FROM ticket");
    return data.map((ticketData) => new Ticket(ticketData)); // Map through data
  }

  static async findById(id) {
    await db.query("SELECT * FROM ticket WHERE id = ?", [id]);
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