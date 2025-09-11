/* ---- Pricing rules ---- */
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

  if (manualDiscount || manualDiscount === 0) {
    // Manual discount replaces all other discounts
    discountPercent = manualDiscount;
  } else {
    // Bulk/User discount
    if (users >= 50) userDisc = 20;
    else if (users >= 25) userDisc = 15;
    else if (users >= 10) userDisc = 10;

    // Multi-year discount
    if (years === 3) termDisc = 10;

    discountPercent = userDisc + termDisc;
  }

  const discountValue = (discountPercent / 100) * basePrice;
  const finalPrice = basePrice - discountValue;

  return { finalPrice, userDisc, termDisc, discountPercent };
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
    results.innerHTML = `<p>Please enter users, select tiers, and years.</p>`;
    return;
  }

  // Table header
  let html = `<table><thead><tr>`;
  html += `<th class="users">Total Users</th><th>Product Tier</th>`;
  years.forEach(term => {
    html += `<th>${term} Year${term > 1 ? "s" : ""}</th>`;
  });
  html += `</tr></thead><tbody>`;

  // Users cell spans all tiers
  html += `<tr><td class="users" rowspan="${tiers.length}">${users}</td>`;

  tiers.forEach((tier, idx) => {
    if (idx > 0) html += `<tr>`; // new row except first

    html += `<td class="tier">${tier}</td>`;
    years.forEach(term => {
      const r = calculatePrice(users, tier, term, manualDiscount);
      html += `<td>
        <div><strong>Final Price:</strong> $${formatNumber(r.finalPrice)}</div>
        ${
          manualDiscount !== null
            ? `<div class="badge badge-manual">Manual Discount ${manualDiscount.toFixed(2)}%</div>`
            : `
              ${r.userDisc > 0 ? `<div class="badge badge-user">User Discount ${r.userDisc.toFixed(2)}%</div>` : ""}
              ${r.termDisc > 0 ? `<div class="badge badge-term">Multi-Year Discount ${r.termDisc.toFixed(2)}%</div>` : ""}
            `
        }
      </td>`;
    });

    html += `</tr>`;
  });

  html += `</tbody></table>`;
  results.innerHTML = html;
}

/* ---- Events ---- */
document.getElementById("calcBtn").addEventListener("click", renderTable);
document.getElementById("detailsToggle").addEventListener("change", renderTable);
