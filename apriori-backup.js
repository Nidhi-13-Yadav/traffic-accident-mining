
function apriori(transactions, minSupport = 0.2) {
    const totalTransactions = transactions.length;
  
    if (totalTransactions === 0) {
      return [];
    }
  
    // Count how often an itemset appears.
    function getSupport(itemset) {
      const count = transactions.filter(transaction =>
        itemset.every(item => transaction.includes(item))
      ).length;
  
      return {
        count,
        support: count / totalTransactions
      };
    }
  
    // Start with individual items.
    const allItems = [
      ...new Set(transactions.flat())
    ].sort();
  
    let currentItemsets = allItems.map(item => [item]);
    const frequentItemsets = [];
  
    while (currentItemsets.length > 0) {
      const frequent = [];
  
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
  
      // Generate larger candidate itemsets.
      const candidates = new Map();
  
      for (let i = 0; i < frequent.length; i++) {
        for (let j = i + 1; j < frequent.length; j++) {
          const combined = [
            ...new Set([...frequent[i], ...frequent[j]])
          ].sort();
  
          if (
            combined.length === frequent[i].length + 1 &&
            combined.every(item =>
              frequent[i].includes(item) ||
              frequent[j].includes(item)
            )
          ) {
            candidates.set(combined.join("|||"), combined);
          }
        }
      }
  
      currentItemsets = [...candidates.values()];
    }
  
    return frequentItemsets;
  }
  
  module.exports = apriori;
  