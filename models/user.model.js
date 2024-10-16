const db = require("../data/database");
const bcrypt = require("bcryptjs");

class User {
  constructor(name, email, password) {
    this.name = name;
    this.email = email;
    this.password = password;
  }

  async findAll() {
    await db.query("SELECT * FROM users");
  }

// Function to get user by email
async getUserEmail(email) {
  // Assuming db.query returns a Promise
  const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]); // Pass email as an array
  return rows.length > 0 ? rows[0] : null; // Return the first row or null if no user found
}

/* // Function to check if user exists
async userExist(email) {
  const user = await this.getUserEmail(email);
  return user !== null; // Return true if user exists, false otherwise
} */

  static async findById(id) {
    await db.query("SELECT id, name, email, role FROM users WHERE id = ?", [id]);
  }

  static async admin() {
    await db.query("SELECT * FROM users WHERE role = admin");
  }

  static async agent() {
    await db.query("SELECT * FROM users WHERE role = agent");
  }

  async createUser() {
    const hashedPassword = await bcrypt.hash(this.password, 12);
    const data = [this.name, this.email, hashedPassword];
    await db.query("INSERT INTO users (name, email, password) VALUES (?) ", [
      data,
    ]);
  }

  async comparePassword(hashedPassword) {
    return bcrypt.compare(this.password, hashedPassword);
  }
}

module.exports = User;
