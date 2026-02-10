class FileChunker {
  static slice(buf, idx, size) {
    return buf.slice(idx * size, idx * size + size);
  }
}

module.exports = FileChunker;
