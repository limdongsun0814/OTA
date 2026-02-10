class SecretStore {
  static store = new Map();

  static create(chipId, params) {
    if (!this.store.has(chipId)) {
      this.store.set(chipId, {
        chipId,
        filePath: params.fileName,
        fileSize: params.fileSize,
        chunkSize: params.chunkSize,
        chunkMax: params.chunkCnt,
        chunkIndex: 0,
      });
    }
    return this.store.get(chipId);
  }

  static get(chipId) {
    return this.store.get(chipId);
  }

  static remove(chipId) {
    this.store.delete(chipId);
  }
}

module.exports = SecretStore;
