
function apriori(transactions, minSupport = 0.2) {
  const totalTransactions = transactions.length;

  if (totalTransactions === 0) {
    return [];
  }

  // Calculate the support count and support percentage.
  function getSupport(itemset) {
    const count = transactions.filter(transaction =>
      itemset.every(item => transaction.includes(item))
    ).length;

    return {
      count,
      support: count / totalTransactions
    };
  }

  // Get all unique items from the transactions.
  const allItems = [...new Set(transactions.flat())].sort();

  let currentItemsets = allItems.map(item => [item]);
  const frequentItemsets = [];

  while (currentItemsets.length > 0) {
    const frequent = [];

    // Keep only itemsets that meet minimum support.
    for (const itemset of currentItemsets) {
      const result = getSupport(itemset);

      if (result.support >= minSupport) {
        frequent.push(itemset);

        frequentItemsets.push({
          items: itemset,
          count: result.count,
          support: result.support
        });
      }
    }

    // Generate candidates from frequent itemsets.
    const candidates = new Map();

    for (let i = 0; i < frequent.length; i++) {
      for (let j = i + 1; j < frequent.length; j++) {
        const first = frequent[i];
        const second = frequent[j];

        // Join only itemsets sharing their first k-1 items.
        const samePrefix = first
          .slice(0, -1)
          .every((item, index) => item === second[index]);

        if (!samePrefix) {
          continue;
        }

        const combined = [...new Set([...first, ...second])].sort();

        if (combined.length !== first.length + 1) {
          continue;
        }

        // Every subset must be frequent (Apriori pruning).
        const allSubsetsFrequent = combined.every((_, index) => {
          const subset = combined.filter((__, i) => i !== index);
          return frequent.some(itemset =>
            itemset.length === subset.length &&
            itemset.every((item, i) => item === subset[i])
          );
        });

        if (allSubsetsFrequent) {
          candidates.set(combined.join("|||"), combined);
        }
      }
    }

    currentItemsets = [...candidates.values()];
  }

  return frequentItemsets;
}

module.exports = apriori;
