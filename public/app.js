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

    // Clear previous content
    const tableBody = document.querySelector("#inventory tbody");
    tableBody.innerHTML = "";

    // Populate the table with items
    items.forEach(it => {
        const row = document.createElement("tr");

        // Item Name
        const nameCell = document.createElement("td");
        nameCell.textContent = it.name;
        nameCell.style.border = "1px solid black";
        nameCell.style.padding = "8px";
        row.appendChild(nameCell);

        // Quantity
        const quantityCell = document.createElement("td");
        quantityCell.textContent = it.quantity;
        quantityCell.style.border = "1px solid black";
        quantityCell.style.padding = "8px";
        row.appendChild(quantityCell);

        // Date Brought
        const dateBroughtCell = document.createElement("td");
        dateBroughtCell.textContent = new Date(it.dateBrought).toLocaleDateString();
        dateBroughtCell.style.border = "1px solid black";
        dateBroughtCell.style.padding = "8px";
        row.appendChild(dateBroughtCell);

        // Expiration Date
        const expiryCell = document.createElement("td");
        expiryCell.textContent = new Date(it.expiryDate).toLocaleDateString();
        expiryCell.style.border = "1px solid black";
        expiryCell.style.padding = "8px";
        row.appendChild(expiryCell);

        // Recipe
        const recipeCell = document.createElement("td");
        recipeCell.textContent = it.recipe || "N/A";
        recipeCell.style.border = "1px solid black";
        recipeCell.style.padding = "8px";
        row.appendChild(recipeCell);

        // Actions
        const actionsCell = document.createElement("td");
        actionsCell.style.border = "1px solid black";
        actionsCell.style.padding = "8px";
        const delButton = document.createElement("button");
        delButton.textContent = "❌";
        delButton.onclick = async () => {
            await fetch(`/api/items/${it._id}`, { method: "DELETE" });
            refresh();
        };
        actionsCell.appendChild(delButton);
        row.appendChild(actionsCell);

        tableBody.appendChild(row);
    });
}

  form.onsubmit = async e => {
    e.preventDefault();
    const item = {
      name: document.getElementById("name").value,
      quantity: document.getElementById("quantity").value,
      dateBrought: document.getElementById("dateBrought").value,
      expiryDate: document.getElementById("expiryDate").value,
      recipe: document.getElementById("recipe").value
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

