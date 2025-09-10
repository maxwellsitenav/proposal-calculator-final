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

  if (manualDiscount) {
    discountPercent = manualDiscount;
  } else {
    if (users >= 50) {
      userDisc = 20;
    } else if (users >= 25) {
      userDisc = 15;
    } else if (users >= 10) {
      userDisc = 10;
    }
    if (years === 3 || years === 5) {
      termDisc = 10;
    }
    discountPercent = userDisc + termDisc;
  }

  const discountValue = (discountPercent / 100) * basePrice;
  const finalPrice = basePrice - discountValue;
  const perUserPerYear = finalPrice / (users * years);

  return { basePrice, userDisc, termDisc, discountPercent, discountValue, finalPrice, perUserPerYear };
}

function getSelectedValues(selectEl) {
  return Array.from(selectEl.selectedOptions).map(opt => parseInt(opt.value) || opt.value);
}

function renderTable() {
  const users = parseInt(document.getElementById("numUsers").value);
  const manualDiscount = parseFloat(document.getElementById("manualDiscount").value) || null;
  const showDetails = document.getElementById("detailsToggle").checked;

  const selectedTiers = getSelectedValues(document.getElementById("productTier"));
  const selectedYears = getSelectedValues(document.getElementById("termYears"));

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  if (!users || selectedTiers.length === 0 || selectedYears.length === 0) {
    resultsDiv.innerHTML = "<p>Please enter users, select at least one tier and one term.</p>";
    return;
  }

  let table = `<table>
    <tr>
      <th>Total Users</th>
      <th>Product Tier</th>`;

  selectedYears.forEach(term => {
    table += `<th>${term} Year${term > 1 ? "s" : ""}</th>`;
  });
  table += `</tr>`;

  selectedTiers.forEach(tier => {
    table += `<tr><td>${users}</td><td>${tier}</td>`;
    selectedYears.forEach(term => {
      const result = calculatePrice(users, tier, term, manualDiscount);

      if (showDetails) {
        table += `<td>
          <div><strong>Full Price:</strong> $${(prices[tier] * users * term).toFixed(2)}</div>
          ${manualDiscount ? 
            `<div class="badge badge-manual">Manual Discount ${manualDiscount}%</div>` : 
            `
            ${result.userDisc > 0 ? `<div class="badge badge-bulk">Bulk Discount ${result.userDisc}%</div>` : ""}
            ${result.termDisc > 0 ? `<div class="badge badge-term">Multi-Year Discount ${result.termDisc}%</div>` : ""}
            `}
          <div>Total Disc: ${result.discountPercent}% ($${result.discountValue.toFixed(2)})</div>
          <div>Price/user/year: $${result.perUserPerYear.toFixed(2)}</div>
          <div class="final-price">$${result.finalPrice.toFixed(2)}</div>
        </td>`;
      } else {
        table += `<td>
          <div class="final-price">$${result.finalPrice.toFixed(2)}</div>
          ${manualDiscount ? 
            `<div class="badge badge-manual">Manual Discount ${manualDiscount}%</div>` : 
            `
            ${result.userDisc > 0 ? `<div class="badge badge-bulk">Bulk Discount ${result.userDisc}%</div>` : ""}
            ${result.termDisc > 0 ? `<div class="badge badge-term">Multi-Year Discount ${result.termDisc}%</div>` : ""}
            `}
        </td>`;
      }
    });
    table += `</tr>`;
  });

  table += `</table>`;
  resultsDiv.innerHTML = table;

  document.getElementById("copyImageBtn").style.display = "inline-block";
}

document.getElementById("calcBtn").addEventListener("click", renderTable);
document.getElementById("detailsToggle").addEventListener("change", renderTable);

document.getElementById("copyImageBtn").addEventListener("click", () => {
  const resultsDiv = document.getElementById("results");
  html2canvas(resultsDiv).then(canvas => {
    canvas.toBlob(blob => {
      const item = new ClipboardItem({ "image/png": blob });
      navigator.clipboard.write([item]).then(() => {
        alert("Table copied as image! You can now paste it.");
      }).catch(err => {
        console.error("Clipboard copy failed:", err);
        alert("Copy failed. Try using Chrome or Edge.");
      });
    });
  });
});
