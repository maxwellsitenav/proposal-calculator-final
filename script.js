const prices = {
  "Basic": 199,
  "Dispatch": 399,
  "Route Builder": 699
};

function formatNumber(num) {
  return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calculatePrice(users, tier, years, manualDiscount) {
  const basePrice = prices[tier] * users * years;

  let discountPercent = 0;
  let userDisc = 0;
  let termDisc = 0;
  let manualDisc = 0;

  // Multi-year discount always applies for 3 years
  if (years === 3) {
    termDisc = 10;
  }

  if (manualDiscount || manualDiscount === 0) {
    // Manual replaces user discount, but can stack with 3-year term
    manualDisc = manualDiscount;
    discountPercent = termDisc + manualDisc;
  } else {
    // Normal rule: user discount + (optional) 3-year term
    if (users >= 50) userDisc = 20;
    else if (users >= 25) userDisc = 15;
    else if (users >= 10) userDisc = 10;
    discountPercent = userDisc + termDisc;
  }

  const discountValue = (discountPercent / 100) * basePrice;
  const finalPrice = basePrice - discountValue;
  const perUserPerYear = finalPrice / (users * years);

  return { basePrice, userDisc, termDisc, manualDisc, discountPercent, discountValue, finalPrice, perUserPerYear };
}

function getCheckedValues(containerId) {
  return Array.from(document.querySelectorAll(`#${containerId} input:checked`))
    .map(input => input.value.match(/^\d+$/) ? parseInt(input.value, 10) : input.value);
}

function renderTable() {
  const users = parseInt(document.getElementById("numUsers").value, 10);
  const manualRaw = document.getElementById("manualDiscount").value.trim();
  const manualDiscount = manualRaw === "" ? null : Math.max(0, Math.min(100, parseFloat(manualRaw)));
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
  html += `<th class="users">Total Users</th><th>Product Tier</th>`;
  years.forEach(term => {
    if (term === 1) {
      html += `<th>1 Year Term</th>`;
    } else if (term === 3) {
      html += `<th>3 Year Term</th>`;
    }
  });
  html += `</tr></thead><tbody>`;

  // Users cell spans all tiers
  html += `<tr><td class="users" rowspan="${tiers.length}">${users}</td>`;

  tiers.forEach((tier, idx) => {
    if (idx > 0) html += `<tr>`; // new row except first

    html += `<td class="tier">${tier}</td>`;
    years.forEach(term => {
      const r = calculatePrice(users, tier, term, manualDiscount);

      if (showDetails) {
        html += `<td class="details-cell">
          <div><strong>Full Price:</strong> $${formatNumber(r.basePrice)}</div>
          ${
            manualDiscount !== null
              ? `
                <div class="badge badge-manual">Discount ${r.manualDisc.toFixed(2)}%</div>
                ${r.termDisc > 0 ? `<div class="badge badge-term">Multi-Year Discount ${r.termDisc.toFixed(2)}%</div>` : ""}
              `
              : `
                ${r.userDisc > 0 ? `<div class="badge badge-user">User Discount ${r.userDisc.toFixed(2)}%</div>` : ""}
                ${r.termDisc > 0 ? `<div class="badge badge-term">Multi-Year Discount ${r.termDisc.toFixed(2)}%</div>` : ""}
              `
          }
          <ul class="details-list">
            <li>Total Discount: ${r.discountPercent.toFixed(2)}% ($${formatNumber(r.discountValue)})</li>
            <li>Price / user / year: $${formatNumber(r.perUserPerYear)}</li>
          </ul>
          <span class="final-price">Final Price: $${formatNumber(r.finalPrice)}</span>
        </td>`;
      } else {
        html += `<td>
          <span class="final-price">Final Price: $${formatNumber(r.finalPrice)}</span>
          ${
            manualDiscount !== null
              ? `
                <div class="badge badge-manual">Discount ${r.manualDisc.toFixed(2)}%</div>
                ${r.termDisc > 0 ? `<div class="badge badge-term">Multi-Year Discount ${r.termDisc.toFixed(2)}%</div>` : ""}
              `
              : `
                ${r.userDisc > 0 ? `<div class="badge badge-user">User Discount ${r.userDisc.toFixed(2)}%</div>` : ""}
                ${r.termDisc > 0 ? `<div class="badge badge-term">Multi-Year Discount ${r.termDisc.toFixed(2)}%</div>` : ""}
              `
          }
        </td>`;
      }
    });

    html += `</tr>`;
  });

  html += `</tbody></table>`;
  results.innerHTML = html;
}

// Download table as PNG (higher resolution)
document.getElementById("downloadBtn").addEventListener("click", () => {
  const results = document.getElementById("results");
  const table = results.querySelector("table");
  if (!table) {
    alert("Please generate the table first by clicking Calculate.");
    return;
  }

  html2canvas(table, { scale: 2 }).then(canvas => {
    const link = document.createElement("a");
    link.download = "proposal-table.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
});


document.getElementById("calcBtn").addEventListener("click", renderTable);
document.getElementById("detailsToggle").addEventListener("change", renderTable);
