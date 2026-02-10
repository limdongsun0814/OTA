const fs = require("fs/promises");
const crypto = require("crypto");

class FileCache {
  static files = new Map();
  static async get(filePath) {
    if (!this.files.has(filePath)) {
      const buf = await fs.readFile(filePath);
      const hash = crypto.createHash("sha256").update(buf).digest("hex");
      this.files.set(filePath, {
        buffer: buf,
        hash: hash,
        refCnt: 0,
      });
    }
    return this.files.get(filePath);
  }
  static release(filePath) {
    const file = this.files.get(filePath);
    if (!file) return;
    file.refCnt--;
    if (file.refCnt == 0) this.files.delete(filePath);
  }
}

module.exports = FileCache;
