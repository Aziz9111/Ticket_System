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

  static async findById(id) {
    await db.query("SELECT id, name, email, role FROM users WHERE id = ?", id);
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
