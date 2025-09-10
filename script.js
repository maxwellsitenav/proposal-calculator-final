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
    // Bulk discount
    if (users >= 50) {
      userDisc = 20;
    } else if (users >= 25) {
      userDisc = 15;
    } else if (users >= 10) {
      userDisc = 10;
    }

    // Multi-year discount
    if (years === 3 || years === 5) {
      termDisc = 10;
    }

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

document.getElementById("calcBtn").addEventListener("click", () => {
  const users = parseInt(document.getElementById("numUsers").value);
  const years = parseInt(document.getElementById("termYears").value);
  const manualDiscount = parseFloat(document.getElementById("manualDiscount").value) || null;
  const showDetails = document.getElementById("detailsToggle").checked;

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  // Create table
  let table = `<table>
    <tr>
      <th>Total Users</th>
      <th>Product Tier</th>
      <th>1 Year Term</th>
      <th>3 Year Term</th>
      <th>5 Year Term</th>
    </tr>
    <tr>
      <td rowspan="3">${users}</td>
  `;

  ["Basic", "Dispatch", "Route Builder"].forEach((tier) => {
    table += `<tr><td>${tier}</td>`;
    [1, 3, 5].forEach((term) => {
      const result = calculatePrice(users, tier, term, manualDiscount);

      if (showDetails) {
        table += `<td>
          <div><strong>Full Price:</strong> $${(prices[tier] * users * term).toFixed(2)}</div>
          <div>User Disc: ${result.userDisc}% ($${((result.userDisc/100) * prices[tier] * users * term).toFixed(2)})</div>
          <div>Term Disc: ${result.termDisc}% ($${((result.termDisc/100) * prices[tier] * users * term).toFixed(2)})</div>
          <div>Total Disc: ${result.discountPercent}% ($${result.discountValue.toFixed(2)})</div>
          <div>Price/user/year: $${result.perUserPerYear.toFixed(2)}</div>
          <div><strong>Final Price:</strong> $${result.finalPrice.toFixed(2)}</div>
        </td>`;
      } else {
        table += `<td>
          <div><strong>Final Price:</strong> $${result.finalPrice.toFixed(2)}</div>
          <div>Discount: ${result.discountPercent}%</div>
        </td>`;
      }
    });
    table += `</tr>`;
  });

  table += `</table>`;
  resultsDiv.innerHTML = table;
});
