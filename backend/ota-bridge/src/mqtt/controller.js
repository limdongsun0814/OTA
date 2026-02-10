const FileCache = require("../file/FileCache");
const FileChunker = require("../file/FileChunker");
const db = require("../db/mysql");
const SecretStore = require("../State/SecretStore");

class Controller {
  #server;
  #crypto;
  #socket;
  constructor(mqtt, crypto, socket) {
    this.#server = mqtt;
    this.#crypto = crypto;
    this.#socket = socket;
  }
  subscribe() {
    this.#server
      .subscribe("backend", (err) => {
        if (!err) {
          console.log("backend 구독 성공");
        } else {
          console.log("구독 실패", err);
        }
      })
      .subscribe("status", (err) => {
        if (!err) {
          console.log("backend 구독 성공");
        } else {
          console.log("구독 실패", err);
        }
      });
  }
  async pubStatus(state) {
    const file = await FileCache.get(state.filePath);
    file.refCnt++;
    const buf = Buffer.alloc(4);
    buf.writeUInt32BE(state.fileSize);
    let transfer = Buffer.concat([Buffer.from(file.hash, "hex"), buf]);
    this.#server.publish(state.chipId + "status", transfer);
  }
  async pubFirmware(state) {
    if (state.chunkIndex - 1 == 0) {
      db.executeQuery(
        "update mcu set status = 'uploading' where chip_id = ?",
        state.chipId,
      );
      this.#socket.emit("status", { [state.chipId]: "uploading" });
    }

    const file = await FileCache.get(state.filePath);
    let buf = FileChunker.slice(
      file.buffer,
      state.chunkIndex - 1,
      state.chunkSize,
    );
    let { iv, encryptedArr } = this.#crypto.crypto(buf);
    let transfer = Buffer.concat([iv, encryptedArr]);
    console.log(
      "chipId: %d chunkIndex: %d chunkMax: %d buf.length: %d",
      state.chipId,
      state.chunkIndex,
      state.chunkMax,
      buf.length,
    );
    this.#server.publish(state.chipId, transfer, (err) => {
      if (state.chunkIndex == state.chunkMax) {
        db.executeQuery(
          "update mcu set status = 'restart' where chip_id in(?) ",
          state.chipId,
        );
        this.#socket.emit("status", { [state.chipId]: "restart" });
        FileCache.release(state.filePath);
        SecretStore.remove(state.chipId);
      }
    });
  }
}
module.exports = Controller;
