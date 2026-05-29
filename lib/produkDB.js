const fs = require("fs");
const axios = require("axios");

const dbPath = "./data/produk.json";

function loadProduk() {
  if (!fs.existsSync(dbPath)) return [];
  return JSON.parse(fs.readFileSync(dbPath));
}

function saveProduk(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

global.pending = global.pending || {};

module.exports = {
  loadProduk,
  saveProduk
};