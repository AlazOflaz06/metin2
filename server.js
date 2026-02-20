const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");
const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
const User = require("./models/User");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/ankaMMO");

app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    await User.create({ username, password: hashed });
    res.json({ success: true });
  } catch {
    res.status(400).json({ success: false });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ success: false });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ success: false });

  res.json({ success: true });
});

const server = app.listen(5000);
const wss = new WebSocket.Server({ server });

let players = {};
let metin = { hp: 500, maxHp: 500 };
let boss = { hp: 2000, maxHp: 2000, x: 20, z: 20 };

wss.on("connection", (ws) => {

  const id = uuidv4();

  players[id] = {
    id,
    x: 0,
    z: 0,
    level: 1,
    exp: 0,
    hp: 100,
    baseDamage: 20,
    gold: 0,
    inventory: [],
    equipped: null,
    cooldown: 0
  };

  ws.on("message", (msg) => {
    const data = JSON.parse(msg);
    const player = players[id];
    if (!player) return;

    if (data.type === "move") {
      player.x = data.x;
      player.z = data.z;
    }

    if (data.type === "skill") {

      const now = Date.now();
      if (now < player.cooldown) return;

      player.cooldown = now + 1000;

      const weaponBonus = player.equipped ? player.equipped.power : 0;
      const damage = player.baseDamage + weaponBonus;

      metin.hp -= damage;

      if (metin.hp <= 0) {

        metin.hp = metin.maxHp;

        player.exp += 50;
        player.gold += 100;

        player.inventory.push({
          name: "Sword",
          level: 0,
          power: 10
        });

        if (player.exp >= 100) {
          player.level++;
          player.exp = 0;
          player.baseDamage += 5;
        }
      }
    }

    if (data.type === "equip") {
      const item = player.inventory[data.slot];
      if (item) player.equipped = item;
    }

    if (data.type === "upgrade") {

      const item = player.inventory[data.slot];
      if (!item) return;
      if (player.gold < 50) return;

      player.gold -= 50;

      if (Math.random() < 0.7) {
        item.level++;
        item.power += 5;
      }
    }
  });

  ws.on("close", () => {
    delete players[id];
  });
});

setInterval(() => {

  Object.values(players).forEach(p => {

    const dx = p.x - boss.x;
    const dz = p.z - boss.z;
    const dist = Math.sqrt(dx*dx + dz*dz);

    if (dist < 8) {
      p.hp -= 5;
      if (p.hp < 0) p.hp = 100;
    }
  });

}, 1000);

setInterval(() => {
  wss.clients.forEach(client => {
    client.send(JSON.stringify({
      type: "update",
      players,
      metin,
      boss
    }));
  });
}, 50);
