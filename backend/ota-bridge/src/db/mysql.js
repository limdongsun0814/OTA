require("dotenv").config();

const mysql = require("mysql2/promise");

class Mysql {
  static instance;
  #pool;
  constructor() {
    if (Mysql.instance) {
      return Mysql.instance;
    }

    Mysql.instance = this;

    this.#pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    });
  }
  async executeQuery(query, values) {
    if (!this.#pool) {
      throw new Error("DB가 연결되지 않았습니다.");
    }
    return this.#pool.query(query, values);
  }
}

module.exports = new Mysql();
