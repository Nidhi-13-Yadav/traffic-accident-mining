
const button = document.getElementById("refreshButton");
const message = document.getElementById("serverMessage");

async function loadAccidentStats() {
  message.textContent = "Loading accident statistics...";

  try {
    const response = await fetch("/api/stats");

    if (!response.ok) {
      throw new Error("Could not load accident statistics");
    }

    const data = await response.json();

    document.getElementById("totalRecords").textContent =
      data.totalRecords;

    document.getElementById("weatherCount").textContent =
      data.weatherCount;

    // Count the different severity categories.
    const severityTypes = Object.keys(data.severityCounts);
    document.getElementById("patternCount").textContent =
      severityTypes.length;

    message.textContent = data.message;
  } catch (error) {
    message.textContent =
      "Could not load statistics. Check the server and CSV file.";
    console.error(error);
  }
}

// Refresh statistics when the button is clicked.
button.addEventListener("click", loadAccidentStats);

// Load statistics automatically when the dashboard opens.
loadAccidentStats();


async function loadPatterns() {
  const table = document.getElementById("patternsTable");

  try {
    const response = await fetch("/api/patterns");

    if (!response.ok) {
      throw new Error("Could not load patterns");
    }

    const data = await response.json();

    table.replaceChildren();

    data.patterns
      .filter(pattern => pattern.items.length >= 2)
      .sort((a, b) => b.support - a.support)
      .forEach(pattern => {
        const row = document.createElement("tr");

        const patternCell = document.createElement("td");
        patternCell.textContent = pattern.items.join(" + ");

        const countCell = document.createElement("td");
        countCell.textContent = pattern.count;

        const supportCell = document.createElement("td");
        supportCell.textContent =
          (pattern.support * 100).toFixed(1) + "%";

        row.append(patternCell, countCell, supportCell);
        table.appendChild(row);
      });
  } catch (error) {
    table.replaceChildren();

    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = 3;
    cell.textContent = "Could not load patterns. Check the server.";

    row.appendChild(cell);
    table.appendChild(row);

    console.error(error);
  }
}

loadPatterns();

async function loadAssociationRules() {
  const table = document.getElementById("rulesTable");

  try {
    const response = await fetch("/api/rules");

    if (!response.ok) {
      throw new Error("Could not load association rules");
    }

    const data = await response.json();
    table.replaceChildren();

    data.rules.forEach(rule => {
      const row = document.createElement("tr");

      const antecedentCell = document.createElement("td");
      antecedentCell.textContent = rule.antecedent.join(" + ");

      const consequentCell = document.createElement("td");
      consequentCell.textContent = rule.consequent.join(" + ");

      const supportCell = document.createElement("td");
      supportCell.textContent =
        (rule.support * 100).toFixed(1) + "%";

      const confidenceCell = document.createElement("td");
      confidenceCell.textContent =
        (rule.confidence * 100).toFixed(1) + "%";

      const liftCell = document.createElement("td");
      liftCell.textContent = rule.lift.toFixed(2);

      row.append(
        antecedentCell,
        consequentCell,
        supportCell,
        confidenceCell,
        liftCell
      );

      table.appendChild(row);
    });

  } catch (error) {
    table.replaceChildren();

    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = 5;
    cell.textContent = "Could not load association rules. Check the server.";

    row.appendChild(cell);
    table.appendChild(row);

    console.error("Association rules loading error:", error);
  }
}

loadAssociationRules();



async function loadAccidentCharts() {
  try {
    const response = await fetch("/api/stats");

    if (!response.ok) {
      throw new Error("Could not load accident statistics");
    }

    const data = await response.json();

    // Chart 1: Accident severity
    new Chart(document.getElementById("severityChart"), {
      type: "doughnut",
      data: {
        labels: Object.keys(data.severityCounts),
        datasets: [{
          label: "Accidents",
          data: Object.values(data.severityCounts)
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true
      }
    });

    // Chart 2: Weather conditions
    const weatherResponse = await fetch("/api/weather-counts");

    if (!weatherResponse.ok) {
      throw new Error("Could not load weather counts");
    }

    const weatherData = await weatherResponse.json();

    new Chart(document.getElementById("weatherChart"), {
      type: "bar",
      data: {
        labels: Object.keys(weatherData),
        datasets: [{
          label: "Accidents",
          data: Object.values(weatherData)
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    });

    // Chart 3: Road conditions
    const roadResponse = await fetch("/api/road-counts");

    if (!roadResponse.ok) {
      throw new Error("Could not load road counts");
    }

    const roadData = await roadResponse.json();

    new Chart(document.getElementById("roadChart"), {
      type: "bar",
      data: {
        labels: Object.keys(roadData),
        datasets: [{
          label: "Accidents",
          data: Object.values(roadData)
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    });

  } catch (error) {
    console.error("Chart loading error:", error);
  }
}

loadAccidentCharts();


function filterAccidentPatterns() {
  const weather = document.getElementById("weatherFilter").value;
  const road = document.getElementById("roadFilter").value;
  const severity = document.getElementById("severityFilter").value;

  const rows = document.querySelectorAll("#patternsTable tr");

  rows.forEach(row => {
    const patternCell = row.querySelector("td");

    if (!patternCell) return;

    const pattern = patternCell.textContent;

    const matchesWeather =
      weather === "All" || pattern.includes("weather=" + weather);

    const matchesRoad =
      road === "All" || pattern.includes("road_condition=" + road);

    const matchesSeverity =
      severity === "All" || pattern.includes("severity=" + severity);

    row.style.display =
      matchesWeather && matchesRoad && matchesSeverity ? "" : "none";
  });
}

document.getElementById("weatherFilter")
  .addEventListener("change", filterAccidentPatterns);

document.getElementById("roadFilter")
  .addEventListener("change", filterAccidentPatterns);

document.getElementById("severityFilter")
  .addEventListener("change", filterAccidentPatterns);


document.getElementById("resetFilters").addEventListener("click", () => {
  document.getElementById("weatherFilter").value = "All";
  document.getElementById("roadFilter").value = "All";
  document.getElementById("severityFilter").value = "All";

  filterAccidentPatterns();
});
