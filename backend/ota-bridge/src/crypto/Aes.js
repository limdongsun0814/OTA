const crypto = require("crypto");

class Ase {
  #key;
  constructor(key) {
    this.setKey(key);
  }
  setKey(key) {
    this.#key = key;
  }
  crypto(payload) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-128-cbc", this.#key, iv);
    let encrypted = cipher.update(payload);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const encryptedArr = new Uint8Array(encrypted);
    return { iv, encryptedArr };
  }
}

module.exports = Ase;
