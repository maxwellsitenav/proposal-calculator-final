const prices = {
  "Basic": 199.99,
  "Dispatch": 399.99,
  "Route Builder": 699.99
};

function formatNumber(num) {
  return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calculatePrice(users, tier, years, discount) {
  const basePrice = prices[tier] * users * years;
  let discountPercent = discount || 0;
  const discountValue = (discountPercent / 100) * basePrice;
  const finalPrice = basePrice - discountValue;
  const perUserPerYear = finalPrice / (users * years);
  const perUserPerMonth = finalPrice / (users * years * 12);

  return { basePrice, discountPercent, discountValue, finalPrice, perUserPerYear, perUserPerMonth };
}

function getCheckedValues(containerId) {
  return Array.from(document.querySelectorAll(`#${containerId} input:checked`))
    .map(input => input.value.match(/^\d+$/) ? parseInt(input.value, 10) : input.value);
}

function renderTable() {
  const users = parseInt(document.getElementById("numUsers").value, 10);
  const discount1yrRaw = document.getElementById("discount1yr").value.trim();
  const discount3yrRaw = document.getElementById("discount3yr").value.trim();
  const discount1yr = discount1yrRaw === "" ? 0 : Math.max(0, Math.min(100, parseFloat(discount1yrRaw)));
  const discount3yr = discount3yrRaw === "" ? 0 : Math.max(0, Math.min(100, parseFloat(discount3yrRaw)));
  const showDetails = document.getElementById("detailsToggle").checked;

  const tiers = getCheckedValues("tierOptions");
  const years = getCheckedValues("yearOptions");

  const results = document.getElementById("results");
  results.innerHTML = "";

  if (!users || tiers.length === 0 || years.length === 0) {
    results.innerHTML = `<p>Please enter users, select tiers, and years.</p>`;
    return;
  }

  let html = `<table><thead><tr>`;
  html += `<th class="users">Total Users</th><th class="tier-header">Product Tier</th>`;
  years.forEach(term => {
    if (term === 1) html += `<th>1 Year Term</th>`;
    if (term === 3) html += `<th>3 Year Term</th>`;
  });
  html += `</tr></thead><tbody>`;

  // Users cell spans all tiers
  html += `<tr><td class="users" rowspan="${tiers.length}">${users}</td>`;

  tiers.forEach((tier, idx) => {
    if (idx > 0) html += `<tr>`; // new row except first

    html += `<td class="tier">${tier}</td>`;
    years.forEach(term => {
      const discount = term === 1 ? discount1yr : discount3yr;
      const r = calculatePrice(users, tier, term, discount);

      if (showDetails) {
   html += `<td class="details-cell">

    ${discount > 0 ? `
      <div><strong>List Price:</strong> $${formatNumber(r.basePrice)}</div>
      <div class="badge ${term === 1 ? "badge-user" : "badge-term"}">
        ${term === 1 ? "Discount" : "Multi-Year Discount"} ${discount.toFixed(2)}%
      </div>
    ` : ""}

    <ul class="details-list">
      <li>Price / user / month: $${formatNumber(r.perUserPerMonth)}</li>
    </ul>

    <div class="total-price-wrap">
      <span class="final-price">Total Price: $${formatNumber(r.finalPrice)}</span>
      <div class="price-subtext">
        + any applicable sales tax and credit card fees
      </div>
    </div>

  </td>`;
}
      } else {
        html += `<td>
          <span class="final-price">Final Price: $${formatNumber(r.finalPrice)}</span>
          ${discount > 0 ? `
            <div class="badge ${term === 1 ? "badge-user" : "badge-term"}">
              ${term === 1 ? "Discount" : "Multi-Year Discount"} ${discount.toFixed(2)}%
            </div>` : ""}
        </td>`;
      }
    });

    html += `</tr>`;
  });

  html += `</tbody></table>`;
  results.innerHTML = html;
}

document.getElementById("calcBtn").addEventListener("click", renderTable);
document.getElementById("detailsToggle").addEventListener("change", renderTable);

// Download table as PNG (higher resolution)
document.getElementById("downloadBtn").addEventListener("click", () => {
  const results = document.getElementById("results");
  const table = results.querySelector("table");
  if (!table) {
    alert("Please generate the table first by clicking Calculate.");
    return;
  }

  html2canvas(table, { scale: 3 }).then(canvas => {
    const link = document.createElement("a");
    link.download = "proposal-table.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
});
