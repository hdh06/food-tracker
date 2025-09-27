const content = document.getElementById("tabContent");

async function showTab(tab) {
  const res = await fetch(`pages/${tab}.html`);
  const html = await res.text();
  content.innerHTML = html;

  // Load JS for each tab if needed
  if (tab === "kitchen") loadKitchen();
  if (tab === "analytics") loadAnalytics();
  if (tab === "recipes") loadRecipes();
  if (tab === "foodbank") loadFoodBank();
}

// default tab
showTab("kitchen");

async function loadKitchen() {
  const form = document.getElementById("itemForm");
  const list = document.getElementById("inventory");

  async function refresh() {
    const res = await fetch("/api/items");
    const items = await res.json();
    list.innerHTML = "";
    items.forEach(it => {
      const li = document.createElement("li");
      li.textContent = `${it.name} (${it.quantity}) - exp: ${new Date(it.expiryDate).toLocaleDateString()}`;
      const del = document.createElement("button");
      del.textContent = "❌";
      del.onclick = async () => {
        await fetch(`/api/items/${it._id}`, { method: "DELETE" });
        refresh();
      };
      li.appendChild(del);
      list.appendChild(li);
    });
  }

  form.onsubmit = async e => {
    e.preventDefault();
    const item = {
      name: document.getElementById("name").value,
      quantity: document.getElementById("quantity").value,
      expiryDate: document.getElementById("expiryDate").value
    };
    await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item)
    });
    form.reset();
    refresh();
  };

  refresh();
}

async function loadAnalytics() {
  const res = await fetch("/api/analytics");
  const data = await res.json();

  const ctx = document.getElementById("chart").getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: data.map(d => d.date),
      datasets: [{
        label: "Money Saved",
        data: data.map(d => d.money_saved),
        borderColor: "green"
      }]
    }
  });
}

async function loadRecipes() {
  const res = await fetch("/api/recipes");
  const recipes = await res.json();
  const div = document.getElementById("recipes");
  div.innerHTML = "";
  recipes.forEach(r => {
    const card = document.createElement("div");
    card.className = "recipe";
    card.innerHTML = `<h3>${r.title}</h3><p>${r.instructions}</p>`;
    div.appendChild(card);
  });
}

async function loadFoodBank() {
  const res = await fetch("/api/foodbank");
  const banks = await res.json();
  const list = document.getElementById("foodbanks");
  list.innerHTML = banks.map(b => `<li>${b.name} - ${b.address}</li>`).join("");
}

