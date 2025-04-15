const BREEDING_COOLDOWN = 5 * 60 * 1000;
let coins = 300;
let shopSnakes = [];
let ownedSnakes = [];
let eggs = [];

function showTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById(tab).classList.add('active');
}

function generateGenes() {
  const gene = (name) => {
    const r = Math.random();
    if (r < 0.95) return ['normal', 'normal'];
    if (r < 0.99) return ['normal', name];
    return [name, name];
  };
  const poly = () => (Math.random() < 0.95 ? 0 : Math.floor(Math.random() * 5) + 6);
  return {
    albino: gene("albino"),
    toffee: gene("toffee"),
    hypo: gene("hypo"),
    hypoDutch: gene("hypoDutch"),
    mocha: gene("mocha"),
    mystic: gene("mystic"),
    sable: gene("sable"),
    lavender: gene("lavender"),
    axanthic: gene("axanthic"),
    sunset: gene("sunset"),
    conda: gene("conda"),
    arctic: gene("arctic"),
    frosted: gene("frosted"),
    leucistic: gene("leucistic"),
    redExp: poly(),
    coralExp: poly(),
    greenExp: poly(),
    pinkExp: poly(),
    orangeExp: poly(),
    yellowExp: poly(),
    speckleExp: poly(),
    patternExp: poly()
  };
}

function getPhenotype(genes) {
  let visible = [];
  const has = (g) => genes[g][0] === g && genes[g][1] === g;
  const oneHas = (g) => genes[g][0] === g || genes[g][1] === g;

  if (has("conda")) visible.push("Super Anaconda");
  else if (oneHas("conda")) visible.push("Anaconda");

  if (has("arctic")) visible.push("Super Arctic");
  else if (oneHas("arctic")) visible.push("Arctic");

  if (has("frosted")) visible.push("Super Frosted");
  else if (oneHas("frosted")) visible.push("Frosted");

  if (has("leucistic")) visible.push("Super Leucistic");
  else if (oneHas("leucistic")) visible.push("Leucistic");

  const recessives = ["albino", "toffee", "hypo", "hypoDutch", "mocha", "mystic", "sable", "lavender", "axanthic", "sunset"];
  recessives.forEach(g => { if (has(g)) visible.push(g.charAt(0).toUpperCase() + g.slice(1)); });

  if (genes.redExp >= 6) visible.push("Extreme Red");
  if (genes.coralExp >= 6) visible.push("Coral");
  if (genes.greenExp >= 6) visible.push("Green Phase");
  if (genes.pinkExp >= 6) visible.push("Pink Pastel");
  if (genes.orangeExp >= 6) visible.push("Orange Glow");
  if (genes.yellowExp >= 6) visible.push("Yellow Tint");
  if (genes.speckleExp >= 6) visible.push("Heavy Speckling");
  if (genes.patternExp >= 6) visible.push("Bold Pattern");

  return visible.length ? visible.join(" ") : "Normal";
}

function priceSnake(snake) {
  const morphs = getPhenotype(snake.genes).split(" ").filter(m => m !== "Normal");
  if (morphs.length === 0) return Math.floor(150 * snake.quality);
  return Math.floor(150 + Math.pow(morphs.length, 2.2) * snake.quality * 200);
}

function generateStoreSnake() {
  const genes = generateGenes();
  return {
    name: "Unnamed",
    sex: Math.random() < 0.5 ? "Male" : "Female",
    genes,
    quality: 1,
    lastBred: 0,
    phenotype: getPhenotype(genes)
  };
}

function generateShopSnakes() {
  function generateNormalSnake(sex) {
    return {
      name: "Unnamed",
      sex: sex,
      genes: {
        albino: ["normal", "normal"],
        toffee: ["normal", "normal"],
        hypo: ["normal", "normal"],
        hypoDutch: ["normal", "normal"],
        mocha: ["normal", "normal"],
        mystic: ["normal", "normal"],
        sable: ["normal", "normal"],
        lavender: ["normal", "normal"],
        axanthic: ["normal", "normal"],
        sunset: ["normal", "normal"],
        conda: ["normal", "normal"],
        arctic: ["normal", "normal"],
        frosted: ["normal", "normal"],
        leucistic: ["normal", "normal"],
        redExp: 0,
        coralExp: 0,
        greenExp: 0,
        pinkExp: 0,
        orangeExp: 0,
        yellowExp: 0,
        speckleExp: 0,
        patternExp: 0
      },
      quality: 1,
      lastBred: 0,
      phenotype: "Normal"
    };
  }

  shopSnakes = [
    generateNormalSnake("Male"),
    generateNormalSnake("Female")
  ];
  for (let i = 0; i < 4; i++) {
    shopSnakes.push(generateStoreSnake());
  }
  updateUI(); saveGame();
}

function buySnake(index) {
  const snake = shopSnakes[index];
  const price = priceSnake(snake);
  if (coins >= price) {
    coins -= price;
    ownedSnakes.push(snake);
    generateShopSnakes();
  }
  updateUI(); saveGame();
}

function sellSnake(index) {
  coins += Math.floor(priceSnake(ownedSnakes[index]) / 2);
  ownedSnakes.splice(index, 1);
  updateUI(); saveGame();
}

function breedSnakes() {
  const maleIndex = document.getElementById("maleSelect").value;
  const femaleIndex = document.getElementById("femaleSelect").value;
  if (maleIndex === "" || femaleIndex === "") return;

  const male = ownedSnakes[maleIndex];
  const female = ownedSnakes[femaleIndex];

  if (female.cooldownEnd && Date.now() < female.cooldownEnd) return;
  female.cooldownEnd = Date.now() + BREEDING_COOLDOWN;

  const eggCount = Math.floor(Math.random() * 12) + 1;
  for (let i = 0; i < eggCount; i++) {
    const genes = {};
    for (const gene in male.genes) {
      if (Array.isArray(male.genes[gene])) {
        const g1 = male.genes[gene][Math.floor(Math.random() * 2)];
        const g2 = female.genes[gene][Math.floor(Math.random() * 2)];
        genes[gene] = [g1, g2];
      } else {
        genes[gene] = Math.random() < 0.5 ? male.genes[gene] : female.genes[gene];
      }
    }
    addEgg(genes, male.quality, female.quality);
  }

  female.lastBred = Date.now();
  updateUI(); saveGame();
}

function addEgg(genes, maleQuality, femaleQuality) {
  eggs.push({
    genes,
    readyTime: Date.now() + 5 * 60 * 1000,
    maleQuality,
    femaleQuality
  });
  updateUI(); saveGame();
}

function hatchEgg(i) {
  const inheritedQuality = Math.max(1, Math.floor((eggs[i].maleQuality + eggs[i].femaleQuality) / 2) + (Math.random() < 0.1 ? 1 : 0));
  ownedSnakes.push({
    name: "Hatchling",
    sex: Math.random() < 0.5 ? "Male" : "Female",
    genes: eggs[i].genes,
    quality: inheritedQuality,
    lastBred: 0,
    phenotype: getPhenotype(eggs[i].genes)
  });
  eggs.splice(i, 1);
  updateUI(); saveGame();
}

function refreshBreedingDropdown() {
  const maleSel = document.getElementById("maleSelect");
  const femaleSel = document.getElementById("femaleSelect");

  const selectedMale = maleSel.value;
  const selectedFemale = femaleSel.value;

  maleSel.innerHTML = "<option value=''>Select Male</option>";
  femaleSel.innerHTML = "<option value=''>Select Female</option>";

  ownedSnakes.forEach((snake, i) => {
    const option = document.createElement("option");
    option.value = i;
    option.text = snake.name + " (" + snake.sex + ")";
    if (snake.sex === "Male") {
      maleSel.appendChild(option);
    } else if (!snake.cooldownEnd || Date.now() >= snake.cooldownEnd) {
      femaleSel.appendChild(option);
    }
  });

  maleSel.value = selectedMale;
  femaleSel.value = selectedFemale;
}

function updateUI() {
  refreshBreedingDropdown();
  document.getElementById("coinDisplay").textContent = coins;
  

  const shopList = document.getElementById("shopList");
  shopList.innerHTML = "";
  shopSnakes.forEach((snake, i) => {
  const div = document.createElement("div");
  div.className = "snake";
  div.innerHTML = `
    <strong>Sex:</strong> ${snake.sex}<br>
    <strong>Phenotype:</strong> ${snake.phenotype}<br>
    <strong>Genotype:</strong> ${
      Object.entries(snake.genes).map(([g, v]) =>
        Array.isArray(v) ? g + ": " + v.join("/") : g + ": " + v
      ).join(", ")
    }<br>
    <strong>Quality:</strong> ${snake.quality}<br>
      ${snake.tested ? `<strong>Genotype:</strong> ${
        Object.entries(snake.genes).map(([g, v]) =>
          Array.isArray(v) ? g + ": " + v.join("/") : g + ": " + v
        ).join(", ")
      }<br>` : ``}
      
    <strong>Price:</strong> ${priceSnake(snake)} coins<br>
    <button onclick="buySnake(${i})">Buy</button>
  `;
  shopList.appendChild(div);
});

  const snakeList = document.getElementById("snakeList");
  snakeList.innerHTML = "";
  ownedSnakes.forEach((snake, i) => {
    const cooldownRemaining = snake.cooldownEnd ? Math.max(0, Math.floor((snake.cooldownEnd - Date.now()) / 1000)) : 0;
    const div = document.createElement("div");
    div.className = "snake";
    div.innerHTML = `
      <strong>Name:</strong> ${snake.name}<br>
      <strong>Sex:</strong> ${snake.sex}<br>
      <strong>Phenotype:</strong> ${snake.phenotype}<br>
      <strong>Quality:</strong> ${snake.quality}<br>
      ${snake.tested ? `<strong>Genotype:</strong> ${
        Object.entries(snake.genes).map(([g, v]) =>
          Array.isArray(v) ? g + ": " + v.join("/") : g + ": " + v
        ).join(", ")
      }<br>` : `<button onclick="geneTestSnake(${i})">Gene Test (1000 coins)</button> `}
      <button onclick="renameSnake(${i})">Rename</button> 
      
      ${snake.sex === "Female" && cooldownRemaining > 0 ? `<strong>Cooldown:</strong> ${cooldownRemaining}s<br>` : ""}
      <button onclick="sellSnake(${i})">Sell for ${Math.floor(priceSnake(snake)/2)} coins</button>
    `;
    snakeList.appendChild(div);
  });

  const eggList = document.getElementById("eggList");
  if (eggList) {
    eggList.innerHTML = "";
    eggs.forEach((egg, i) => {
      const div = document.createElement("div");
      const remaining = Math.max(0, Math.floor((egg.readyTime - Date.now()) / 1000));
      div.innerText = `Egg ${i + 1} - Hatches in ${remaining} seconds`;
      const hatchBtn = document.createElement("button");
      hatchBtn.textContent = "Hatch";
      hatchBtn.onclick = function() { hatchEgg(i); };
      hatchBtn.disabled = remaining > 0;
      div.appendChild(hatchBtn);
      eggList.appendChild(div);
    });
  }
}

window.onload = function() {
  loadGame();
  generateShopSnakes();
  setInterval(updateUI, 1000);
};

function renameSnake(index) {
  const newName = prompt("Enter new name for this snake:");
  if (newName && newName.trim() !== "") {
    ownedSnakes[index].name = newName.trim();
    updateUI(); saveGame();
  }
}

function geneTestSnake(index) {
  if (coins >= 1000 && !ownedSnakes[index].tested) {
    coins -= 1000;
    ownedSnakes[index].tested = true;
    updateUI(); saveGame();
  } else if (coins < 1000) {
    alert("Not enough coins for gene test!");
  }
}

function saveGame() {
  localStorage.setItem("snakeGameCoins", JSON.stringify(coins));
  localStorage.setItem("snakeGameOwned", JSON.stringify(ownedSnakes));
  localStorage.setItem("snakeGameEggs", JSON.stringify(eggs));
}

function loadGame() {
  const savedCoins = localStorage.getItem("snakeGameCoins");
  const savedOwned = localStorage.getItem("snakeGameOwned");
  const savedEggs = localStorage.getItem("snakeGameEggs");

  if (savedCoins) coins = JSON.parse(savedCoins);
  if (savedOwned) ownedSnakes = JSON.parse(savedOwned);
  if (savedEggs) eggs = JSON.parse(savedEggs);
}

function resetGame() {
  if (confirm("Are you sure you want to reset your game? This cannot be undone.")) {
    localStorage.removeItem("snakeGameCoins");
    localStorage.removeItem("snakeGameOwned");
    localStorage.removeItem("snakeGameEggs");
    coins = 300;
    ownedSnakes = [];
    eggs = [];
    generateShopSnakes();
    updateUI();
  }
}