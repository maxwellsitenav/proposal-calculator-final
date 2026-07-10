const priceSets = {
  new: {
    "Basic": 199.99,
    "Dispatch": 399.99,
    "Route Builder": 699.99
  },
  old: {
    "Basic": 149.99,
    "Dispatch": 249.99,
    "Route Builder": 449.99
  }
};

function formatNumber(num) {
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function calculatePrice(users, pricePerUser, years, discount) {
  const basePrice = pricePerUser * users * years;
  const discountPercent = discount || 0;
  const discountValue = (discountPercent / 100) * basePrice;
  const finalPrice = basePrice - discountValue;
  const perUserPerYear = finalPrice / (users * years);
  const perUserPerMonth = finalPrice / (users * years * 12);

  return {
    basePrice,
    discountPercent,
    discountValue,
    finalPrice,
    perUserPerYear,
    perUserPerMonth
  };
}

function getCheckedValues(containerId) {
  return Array.from(
    document.querySelectorAll(`#${containerId} input:checked`)
  ).map(input =>
    input.value.match(/^\d+$/)
      ? parseInt(input.value, 10)
      : input.value
  );
}

function renderTable() {
  const users = parseInt(
    document.getElementById("numUsers").value,
    10
  );

  const discount1yrRaw =
    document.getElementById("discount1yr").value.trim();

  const discount3yrRaw =
    document.getElementById("discount3yr").value.trim();

  const discount1yr =
    discount1yrRaw === ""
      ? 0
      : Math.max(
          0,
          Math.min(100, parseFloat(discount1yrRaw))
        );

  const discount3yr =
    discount3yrRaw === ""
      ? 0
      : Math.max(
          0,
          Math.min(100, parseFloat(discount3yrRaw))
        );

  const showDetails =
    document.getElementById("detailsToggle").checked;

  /*
   * Uses New Pricing by default if the pricing selector
   * has not yet been added to index.html.
   */
  const priceVersion =
    document.getElementById("priceVersion")?.value || "new";

  const selectedPrices =
    priceSets[priceVersion] || priceSets.new;

  const tiers = getCheckedValues("tierOptions");
  const years = getCheckedValues("yearOptions");

  const results = document.getElementById("results");
  results.innerHTML = "";

  if (!users || tiers.length === 0 || years.length === 0) {
    results.innerHTML =
      "<p>Please enter users, select tiers, and years.</p>";
    return;
  }

  let html = `<table><thead><tr>`;

  html += `
    <th class="users">Total Users</th>
    <th class="tier-header">Product Tier</th>
  `;

  years.forEach(term => {
    if (term === 1) {
      html += `<th>1 Year Term</th>`;
    }

    if (term === 3) {
      html += `<th>3 Year Term</th>`;
    }
  });

  html += `</tr></thead><tbody>`;

  // One Total Users cell spanning all selected product tiers.
  html += `
    <tr>
      <td class="users" rowspan="${tiers.length}">
        ${users}
      </td>
  `;

  tiers.forEach((tier, index) => {
    if (index > 0) {
      html += `<tr>`;
    }

    html += `<td class="tier">${tier}</td>`;

    years.forEach(term => {
      const discount =
        term === 1 ? discount1yr : discount3yr;

      const pricePerUser = selectedPrices[tier];

      const result = calculatePrice(
        users,
        pricePerUser,
        term,
        discount
      );

      if (showDetails) {
        let discountHTML = "";

        if (discount > 0) {
          discountHTML = `
            <div>
              <strong>List Price:</strong>
              $${formatNumber(result.basePrice)}
            </div>

            <div class="badge ${
              term === 1 ? "badge-user" : "badge-term"
            }">
              ${
                term === 1
                  ? "Discount"
                  : "Multi-Year Discount"
              }
              ${discount.toFixed(2)}%
            </div>
          `;
        }

        html += `
          <td class="details-cell">
            ${discountHTML}

            <ul class="details-list">
              <li>
                Price / user / year:
                $${formatNumber(result.perUserPerYear)}
              </li>
              <li>
                Price / user / month:
                $${formatNumber(result.perUserPerMonth)}
              </li>
            </ul>

            <div class="total-price-wrap">
              <span class="final-price">
                Total Price:
                $${formatNumber(result.finalPrice)}
              </span>

              <div class="price-subtext">
                + any applicable sales tax
              </div>
            </div>
          </td>
        `;
      } else {
        html += `
          <td>
            <span class="final-price">
              Total Price:
              $${formatNumber(result.finalPrice)}
            </span>

            ${
              discount > 0
                ? `
                  <div class="badge ${
                    term === 1
                      ? "badge-user"
                      : "badge-term"
                  }">
                    ${
                      term === 1
                        ? "Discount"
                        : "Multi-Year Discount"
                    }
                    ${discount.toFixed(2)}%
                  </div>
                `
                : ""
            }
          </td>
        `;
      }
    });

    html += `</tr>`;
  });

  html += `</tbody></table>`;
  results.innerHTML = html;
}

document
  .getElementById("calcBtn")
  .addEventListener("click", renderTable);

document
  .getElementById("detailsToggle")
  .addEventListener("change", renderTable);

// Download the generated table as a high-resolution PNG.
document
  .getElementById("downloadBtn")
  .addEventListener("click", () => {
    const results = document.getElementById("results");
    const table = results.querySelector("table");

    if (!table) {
      alert(
        "Please generate the table first by clicking Calculate."
      );
      return;
    }

    html2canvas(table, { scale: 3 }).then(canvas => {
      const link = document.createElement("a");
      link.download = "proposal-table.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  });
