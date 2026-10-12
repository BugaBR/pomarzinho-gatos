const canvas = document.querySelector("#field");
const ctx = canvas.getContext("2d");
const reveal = document.querySelector("#reveal");
const shade = document.querySelector("#shade");
const meowAudio = document.querySelector("#meow-audio");
const instruction = document.querySelector("#instruction");
const catName = document.querySelector("#cat-name");
const tokenCa = document.querySelector("#token-ca");
const copyButton = document.querySelector("#copy-ca");
const copyStatus = document.querySelector("#copy-status");
const tradeButton = document.querySelector("#trade-button");
const unit = 12;
const treeSlots = 14;
const cats = ["Mimi", "Amora", "Nino", "Pipoca", "Chispa"];
const TOKEN_CA = "";
const PUMP_URL = "";
let width = 0;
let height = 0;
let scale = 1;
let clicks = 0;
let found = false;
let revealAt = 12 + Math.floor(Math.random() * 28);
let animationFrame = 0;
let trees = [];
let sparks = [];

tokenCa.value = TOKEN_CA;
tokenCa.readOnly = true;
copyButton.disabled = !TOKEN_CA;
tradeButton.disabled = !TOKEN_CA || !PUMP_URL;

function block(x, y, w, h, color, outline = true) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  if (outline) {
    ctx.strokeStyle = "#17171a";
    ctx.lineWidth = 1;
    ctx.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, Math.round(w) - 1, Math.round(h) - 1);
  }
}

function drawHouse(x, base) {
  const w = unit * 12;
  const wallH = unit * 8;
  const roofRows = [1, 3, 5, 7, 9, 11];
  roofRows.forEach((span, row) => {
    const left = x + (12 - span) * unit / 2;
    for (let col = 0; col < span; col++) {
      const shade = row < 2 ? "#77747e" : "#6a6771";
      block(left + col * unit, base - wallH - (6 - row) * unit, unit, unit, shade);
    }
  });
  const roofBottom = base - wallH;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 12; col++) {
      block(x + col * unit, roofBottom + row * unit, unit, unit, (row + col) % 5 === 0 ? "#77747f" : "#68656f");
    }
  }
  for (let row = 0; row < 4; row++) {
    block(x + unit * 6, base - unit * 4 + row * unit, unit * 2, unit, "#252429");
  }
  block(x + unit * 3, roofBottom + unit * 2, unit * 2, unit * 2, "#85828d");
}

function drawShed(x, base) {
  const bodyX = Math.round(x / unit) * unit;
  const w = unit * 8;
  const top = base - unit * 10;
  for (let col = -1; col <= 8; col++) block(bodyX + col * unit, top, unit, unit, "#716e78");
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 8; col++) {
      block(bodyX + col * unit, top + unit + row * unit, unit, unit, (row + col) % 4 === 0 ? "#77747f" : "#69666f");
    }
  }
  block(bodyX + unit * 3, base - unit * 5, unit * 3, unit * 5, "#17171a");
  block(bodyX + unit * 3, top + unit * 2, unit * 2, unit, "#92909a");
  block(bodyX + unit * 3, top + unit * 3, unit, unit * 2, "#92909a");
  block(bodyX + unit * 2, base - unit * 12, unit * 5, unit * 2, "#6d6a75");
  block(bodyX + unit * 3, base - unit * 13, unit * 3, unit, "#77747f");
  const crateX = Math.min(width - unit * 2, bodyX + w + unit * 2);
  block(crateX, base - unit * 3, unit * 4, unit * 3, "#67646d");
}

function drawTree(tree, base) {
  const cx = Math.round(tree.x / unit) * unit;
  const stage = tree.stage;
  const trunkColor = "#aaa8b1";
  if (stage === 0) {
    block(cx - unit / 2, base - unit * 2, unit, unit * 2, trunkColor);
    block(cx - unit * 2, base - unit, unit, unit, "#d1cfd7");
    block(cx + unit, base - unit, unit, unit, "#d1cfd7");
    return;
  }
  const trunkHeight = (stage + 1) * unit * 2;
  block(cx - unit / 2, base - trunkHeight, unit, trunkHeight, trunkColor);
  if (stage === 1) {
    block(cx - unit, base - trunkHeight + unit, unit, unit, "#d0ced6");
    block(cx + unit / 2, base - trunkHeight + unit * 2, unit, unit, "#d0ced6");
    return;
  }
  const leafY = base - trunkHeight - unit * (stage === 2 ? 1 : 2);
  const spans = stage === 2 ? [1, 3, 3, 1] : [1, 3, 5, 7, 5, 3, 1];
  spans.forEach((span, row) => {
    const left = cx - (span * unit) / 2;
    for (let col = 0; col < span; col++) {
      const color = (row + col) % 3 === 0 ? "#d8d6de" : "#b8b6c0";
      block(left + col * unit, leafY + row * unit, unit, unit, color);
    }
  });
}

function drawGround(base) {
  const rows = Math.ceil((height - base) / unit) + 1;
  for (let row = 0; row < rows; row++) {
    const y = base + row * unit;
    for (let x = 0; x < width; x += unit) {
      const color = row === 0 ? "#77747f" : (Math.floor(x / unit + row) % 5 === 0 ? "#66636c" : "#5d5a63");
      block(x, y, unit, unit, color);
    }
  }
}

function drawSpark(spark) {
  const t = Math.min(1, (performance.now() - spark.start) / 680);
  const rise = 58 * (1 - (1 - t) ** 2);
  const alpha = 1 - t;
  ctx.globalAlpha = alpha;
  const x = spark.x + Math.sin(t * 5 + spark.seed) * 15;
  const y = spark.y - rise;
  block(x, y, 5, 5, "#e9e6ef", false);
  block(x + 6, y - 5, 3, 3, "#a6a2b0", false);
  block(x - 5, y + 7, 3, 3, "#8d8995", false);
  ctx.globalAlpha = 1;
  return t < 1;
}

function draw() {
  ctx.clearRect(0, 0, width, height);
  const base = height - unit * 2;
  drawGround(base);

  const houseW = unit * 12;
  const houseX = Math.max(0, Math.min(width * 0.018, width - houseW));
  drawHouse(houseX, base);
  const shedX = Math.max(width - unit * 14, width * 0.72);
  drawShed(shedX, base);

  trees.forEach((tree) => drawTree(tree, base));
  sparks = sparks.filter(drawSpark);
  if (sparks.length) animationFrame = requestAnimationFrame(draw);
  else animationFrame = 0;
}

function resize() {
  const rect = canvas.getBoundingClientRect();
  scale = Math.min(window.devicePixelRatio || 1, 2);
  width = rect.width;
  height = rect.height;
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);

  const left = width * 0.15;
  const right = width * 0.84;
  trees = Array.from({ length: treeSlots }, (_, i) => ({
    x: left + ((right - left) * i) / (treeSlots - 1),
    stage: [1, 0, 1, 0, 2, 1, 0, 2, 1, 0, 1, 2, 1, 0][i],
  }));
  draw();
}

function playMeow() {
  meowAudio.currentTime = 0;
  meowAudio.play().catch(() => {});
}

function farmAt(clientX, clientY) {
  if (found) return;
  const rect = canvas.getBoundingClientRect();
  const x = Math.max(0, Math.min(width, clientX - rect.left));
  const y = Math.max(0, Math.min(height - unit * 2, clientY - rect.top));
  const tree = trees.reduce((closest, current) => Math.abs(current.x - x) < Math.abs(closest.x - x) ? current : closest, trees[0]);
  tree.stage = Math.min(3, tree.stage + 1);
  clicks += 1;
  playMeow();
  sparks.push({ x, y: Math.max(12, y), start: performance.now(), seed: Math.random() * 9 });
  if (!animationFrame) animationFrame = requestAnimationFrame(draw);

  if (clicks >= revealAt) {
    found = true;
    instruction.textContent = "SOMETHING MOVED IN THE TREES";
    window.setTimeout(showCat, 520);
  } else if (clicks > 4 && Math.random() < 0.12) {
    instruction.textContent = ["THE FIELD THANKS YOU", "JUST A LITTLE MORE", "THE TREES ARE GROWING"][Math.floor(Math.random() * 3)];
  }
}

function showCat() {
  catName.textContent = cats[Math.floor(Math.random() * cats.length)];
  shade.hidden = false;
  reveal.hidden = false;
  reveal.focus();
}


canvas.addEventListener("pointerdown", (event) => farmAt(event.clientX, event.clientY));
canvas.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    farmAt(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }
});
tradeButton.addEventListener("click", () => {
  if (PUMP_URL) window.open(PUMP_URL, "_blank", "noopener,noreferrer");
});
copyButton.addEventListener("click", async () => {
  if (!tokenCa.value) return;
  try {
    await navigator.clipboard.writeText(tokenCa.value);
    copyStatus.textContent = "Copied to clipboard";
  } catch {
    tokenCa.select();
    copyStatus.textContent = "Select and copy the address";
  }
});
window.addEventListener("resize", resize);
resize();
