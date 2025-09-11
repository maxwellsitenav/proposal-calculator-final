/* ---- Pricing rules ---- */
const prices = {
  "Basic": 149.99,
  "Dispatch": 249.99,
  "Route Builder": 449.99
};

function calculatePrice(users, tier, years, manualDiscount) {
  const basePrice = prices[tier] * users * years;

  let discountPercent = 0;
  let userDisc = 0;
  let termDisc = 0;

  if (manualDiscount || manualDiscount === 0) {
    // Manual discount replaces all other discounts
    discountPercent = manualDiscount;
  } else {
    // Bulk discount
    if (users >= 50) userDisc = 20;
    else if (users >= 25) userDisc = 15;
    else if (users >= 10) userDisc = 10;

    // Multi-year discount
    if (years === 3 || years === 5) termDisc = 10;

    discountPercent = userDisc + termDisc;
  }

  const discountValue = (discountPercent / 100) * basePrice;
  const finalPrice = basePrice - discountValue;
  const perUserPerYear = finalPrice / (users * years);

  return {
    basePrice,
    userDisc,
    termDisc,
    discountPercent,
    discountValue,
    finalPrice,
    perUserPerYear
  };
}

/* ---- Utilities ---- */
function getSelectedValues(selectEl) {
  return Array.from(selectEl.selectedOptions).map(opt =>
    opt.value.match(/^\d+$/) ? parseInt(opt.value, 10) : opt.value
  );
}

/* ---- Render table ---- */
function renderTable() {
  const users = parseInt(document.getElementById("numUsers").value, 10);
  const manualRaw = document.getElementById("manualDiscount").value.trim();
  const manualDiscount = manualRaw === "" ? null : Math.max(0, Math.min(100, parseFloat(manualRaw)));
  const showDetails = document.getElementById("detailsToggle").checked;

  const tiers = getSelectedValues(document.getElementById("productTier"));
  const years = getSelectedValues(document.getElementById("termYears"));

  const results = document.getElementById("results");
  results.innerHTML = "";

  if (!users || tiers.length === 0 || years.length === 0) {
    results.innerHTML = `<div class="info">Please enter users and select at least one Product Tier and one Term.</div>`;
    return;
  }

  // Build table
  let html = `<div class="table-wrap"><table><thead><tr>`;
  html += `<th>Total Users</th><th>Product Tier</th>`;
  years.forEach(term => {
    html += `<th>${term} Year${term > 1 ? "s" : ""}</th>`;
  });
  html += `</tr></thead><tbody>`;

  tiers.forEach(tier => {
    html += `<tr><td>${users}</td><td>${tier}</td>`;
    years.forEach(term => {
      const result = calculatePrice(users, tier, term, manualDiscount);

      if (showDetails) {
        html += `<td>
          <div><strong>Full Price:</strong> $${(prices[tier] * users * term).toFixed(2)}</div>
          ${
            manualDiscount !== null
              ? `<div class="badge badge-manual">Manual Discount ${manualDiscount}%</div>`
              : `
                ${result.userDisc > 0 ? `<div class="badge badge-bulk">Bulk Discount ${result.userDisc}%</div>` : ""}
                ${result.termDisc > 0 ? `<div class="badge badge-term">Multi-Year Discount ${result.termDisc}%</div>` : ""}
              `
          }
          <div>Total Discount: ${result.discountPercent}% ($${result.discountValue.toFixed(2)})</div>
          <div>Price / user / year: $${result.perUserPerYear.toFixed(2)}</div>
          <span class="final-price">$${result.finalPrice.toFixed(2)}</span>
        </td>`;
      } else {
        html += `<td>
          <span class="final-price">$${result.finalPrice.toFixed(2)}</span>
          ${
            manualDiscount !== null
              ? `<div class="badge badge-manual">Manual Discount ${manualDiscount}%</div>`
              : `
                ${result.userDisc > 0 ? `<div class="badge badge-bulk">Bulk Discount ${result.userDisc}%</div>` : ""}
                ${result.termDisc > 0 ? `<div class="badge badge-term">Multi-Year Discount ${result.termDisc}%</div>` : ""}
              `
          }
        </td>`;
      }
    });
    html += `</tr>`;
  });

  html += `</tbody></table></div>`;
  results.innerHTML = html;
}

/* ---- Events ---- */
document.getElementById("calcBtn").addEventListener("click", renderTable);
document.getElementById("detailsToggle").addEventListener("change", renderTable);

// (Optional quality-of-life): re-render when selections change
["numUsers","productTier","termYears","manualDiscount"].forEach(id => {
  document.getElementById(id).addEventListener("change", () => {
    // Only auto-render if there's already a table, so it doesn’t pop errors before first calc
    if (document.querySelector(".table-wrap")) renderTable();
  });
});
