const prices = {
  "Basic": 149.99,
  "Dispatch": 249.99,
  "Plus": 449.99
};

function calculatePrice(users, tier, years, manualDiscount) {
  const basePrice = prices[tier] * users * years;

  let discountPercent = 0;
  let userDisc = 0;
  let termDisc = 0;

  if (manualDiscount || manualDiscount === 0) {
    discountPercent = manualDiscount;
  } else {
    if (users >= 50) userDisc = 20;
    else if (users >= 25) userDisc = 15;
    else if (users >= 10) userDisc = 10;
    if (years === 3 || years === 5) termDisc = 10;
    discountPercent = userDisc + termDisc;
  }

  const discountValue = (discountPercent / 100) * basePrice;
  const finalPrice = basePrice - discountValue;

  return { finalPrice, userDisc, termDisc, discountPercent };
}

function getSelectedValues(selectEl) {
  return Array.from(selectEl.selectedOptions).map(opt =>
    opt.value.match(/^\d+$/) ? parseInt(opt.value, 10) : opt.value
  );
}

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

  let html = `<table><thead><tr>`;
  html += `<th>Total Users</th><th>Product Tier</th>`;
  years.forEach(term => {
    html += `<th>${term} Year${term > 1 ? "s" : ""}</th>`;
  });
  html += `</tr></thead><tbody>`;

  tiers.forEach(tier => {
    html += `<tr><td class="users">${users}</td><td class="tier">${tier}</td>`;
    years.forEach(term => {
      const r = calculatePrice(users, tier, term, manualDiscount);
      html += `<td>
        <div><strong>Final Price:</strong> $${r.finalPrice.toFixed(2)}</div>
        ${
          manualDiscount !== null
            ? `<div class="badge badge-manual">Manual Discount ${manualDiscount.toFixed(2)}%</div>`
            : `
              ${r.userDisc > 0 ? `<div class="badge badge-bulk">Bulk Discount ${r.userDisc.toFixed(2)}%</div>` : ""}
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

document.getElementById("calcBtn").addEventListener("click", renderTable);
document.getElementById("detailsToggle").addEventListener("change", renderTable);
