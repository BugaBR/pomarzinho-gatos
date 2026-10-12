const orchard = document.querySelector("#orchard");
const progressFill = document.querySelector("#progress-fill");
const progressCount = document.querySelector("#progress-count");
const treeCount = document.querySelector("#tree-count");
const hint = document.querySelector("#farm-hint");
const discovery = document.querySelector("#discovery");
const backdrop = document.querySelector("#backdrop");
const goal = 8;
let progress = 0;
let soundOn = false;
let audioContext;
const trees = Array.from({ length: 12 }, (_, index) => ({ stage: 0, index }));

function renderOrchard() {
  orchard.innerHTML = trees.map(({ stage, index }) => `
    <button class="plot" type="button" data-index="${index}" data-stage="${stage}" aria-label="Canteiro ${index + 1}, ${stage === 0 ? "vazio" : `árvore crescendo, estágio ${stage} de 3`}">
      <span class="tree" aria-hidden="true"><span class="tree-canopy"></span><span class="tree-trunk"></span><span class="tree-fruit one"></span><span class="tree-fruit two"></span></span>
      <span class="plot-ground" aria-hidden="true"></span><span class="plot-label" aria-hidden="true">plantar</span>
    </button>`).join("");
}

function updateProgress() {
  progressCount.textContent = `${Math.min(progress, goal)} / ${goal}`;
  treeCount.textContent = trees.filter((tree) => tree.stage > 0).length;
  progressFill.style.width = `${Math.min(progress / goal, 1) * 100}%`;
}

function playNote(frequency = 560) {
  if (!soundOn) return;
  audioContext ??= new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.09, audioContext.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.2);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.21);
}

function openDiscovery() {
  discovery.showModal();
  backdrop.classList.add("show");
  document.querySelector("#close-modal").focus();
  playNote(760);
}

function closeDiscovery() {
  if (discovery.open) discovery.close();
  backdrop.classList.remove("show");
  document.querySelector("#continue").focus();
}

orchard.addEventListener("click", (event) => {
  const plot = event.target.closest(".plot");
  if (!plot || progress >= goal) return;
  const tree = trees[Number(plot.dataset.index)];
  tree.stage = Math.min(tree.stage + 1, 3);
  progress += 1;
  plot.dataset.stage = tree.stage;
  plot.setAttribute("aria-label", `Canteiro ${tree.index + 1}, árvore crescendo, estágio ${tree.stage} de 3`);
  updateProgress();
  playNote(430 + tree.stage * 90);

  if (progress >= goal) {
    hint.textContent = "Uma visita especial chegou ao pomar ✨";
    window.setTimeout(openDiscovery, 650);
  } else if (tree.stage === 3) {
    hint.textContent = "Olha só, já tem frutinhas! Continue cuidando ✿";
  } else {
    hint.textContent = ["A terra agradece seu carinho", "Os galhos estão crescendo", "Mais um pouquinho e floresce"][tree.stage - 1];
  }
});

document.querySelector("#sound-toggle").addEventListener("click", (event) => {
  soundOn = !soundOn;
  event.currentTarget.setAttribute("aria-pressed", String(soundOn));
  event.currentTarget.title = soundOn ? "Desativar sons" : "Ativar sons";
  event.currentTarget.querySelector(".sound-label").textContent = soundOn ? "som ligado" : "som desligado";
  playNote();
});

document.querySelector("#close-modal").addEventListener("click", closeDiscovery);
document.querySelector("#continue").addEventListener("click", closeDiscovery);
backdrop.addEventListener("click", closeDiscovery);
discovery.addEventListener("close", () => backdrop.classList.remove("show"));
document.querySelector("#restart").addEventListener("click", () => {
  progress = 0;
  trees.forEach((tree) => { tree.stage = 0; });
  hint.textContent = "Escolha um canteiro para começar";
  updateProgress();
  renderOrchard();
  document.querySelector("#headline").scrollIntoView({ behavior: "smooth", block: "start" });
});

renderOrchard();
updateProgress();
