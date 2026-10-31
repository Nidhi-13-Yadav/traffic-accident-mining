
const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

const apriori = require("./apriori");
const generateAssociationRules = require("./association-rules");

app.use(express.static(path.join(__dirname, "public")));

function readAccidentData(callback) {
  const filePath = path.join(__dirname, "data", "accidents.csv");

  fs.readFile(filePath, "utf8", (error, contents) => {
    if (error) {
      return callback(error);
    }

    const lines = contents.trim().split(/\r?\n/);
    const headers = lines[0].split(",").map(value => value.trim());

    const records = lines.slice(1)
      .filter(line => line.trim() !== "")
      .map(line => {
        const values = line.split(",").map(value => value.trim());

        return Object.fromEntries(
          headers.map((header, index) => [header, values[index]])
        );
      });

    callback(null, records);
  });
}

function makeTransactions(records) {
  return records.map(record => [
    `weather=${record.weather}`,
    `road_condition=${record.road_condition}`,
    `light_condition=${record.light_condition}`,
    `severity=${record.severity}`
  ]);
}

app.get("/api/status", (req, res) => {
  res.json({
    message: "Traffic Accident Pattern Mining server is working!",
    status: "success"
  });
});

app.get("/api/stats", (req, res) => {
  readAccidentData((error, records) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Could not read accident data." });
    }

    const weatherConditions = new Set(
      records.map(record => record.weather).filter(Boolean)
    );

    const severityCounts = records.reduce((counts, record) => {
      if (record.severity) {
        counts[record.severity] = (counts[record.severity] || 0) + 1;
      }
      return counts;
    }, {});

    res.json({
      totalRecords: records.length,
      weatherCount: weatherConditions.size,
      severityCounts,
      message: "Accident statistics loaded successfully."
    });
  });
});

app.get("/api/patterns", (req, res) => {
  readAccidentData((error, records) => {
    if (error) {
      return res.status(500).json({ error: "Could not read accident data." });
    }

    const transactions = makeTransactions(records);
    const patterns = apriori(transactions, 0.2);

    res.json({
      totalTransactions: transactions.length,
      minimumSupport: 0.2,
      patterns
    });
  });
});

app.get("/api/rules", (req, res) => {
  readAccidentData((error, records) => {
    if (error) {
      return res.status(500).json({ error: "Could not read accident data." });
    }

    const transactions = makeTransactions(records);
    const frequentItemsets = apriori(transactions, 0.2);
    const rules = generateAssociationRules(
      transactions,
      frequentItemsets,
      0.5
    );

    res.json({
      totalTransactions: transactions.length,
      minimumSupport: 0.2,
      minimumConfidence: 0.5,
      totalRules: rules.length,
      rules
    });
  });
});

app.get("/api/weather-counts", (req, res) => {
  readAccidentData((error, records) => {
    if (error) {
      return res.status(500).json({ error: "Could not read accident data." });
    }

    const counts = {};

    records.forEach(record => {
      const weather = record.weather;
      if (weather) {
        counts[weather] = (counts[weather] || 0) + 1;
      }
    });

    res.json(counts);
  });
});

app.get("/api/road-counts", (req, res) => {
  readAccidentData((error, records) => {
    if (error) {
      return res.status(500).json({ error: "Could not read accident data." });
    }

    const counts = {};

    records.forEach(record => {
      const road = record.road_condition;
      if (road) {
        counts[road] = (counts[road] || 0) + 1;
      }
    });

    res.json(counts);
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
