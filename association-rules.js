
function generateAssociationRules(
    transactions,
    frequentItemsets,
    minConfidence = 0.5
  ) {
    const totalTransactions = transactions.length;
  
    if (totalTransactions === 0) {
      return [];
    }
  
    // Calculate support for any itemset.
    function getSupport(items) {
      const count = transactions.filter(transaction =>
        items.every(item => transaction.includes(item))
      ).length;
  
      return count / totalTransactions;
    }
  
    const rules = [];
  
    // Examine every frequent itemset containing at least 2 items.
    for (const itemset of frequentItemsets) {
      const items = itemset.items;
  
      if (items.length < 2) {
        continue;
      }
  
      // Generate every non-empty proper subset as the rule's left side.
      const numberOfSubsets = 1 << items.length;
  
      for (let mask = 1; mask < numberOfSubsets - 1; mask++) {
        const antecedent = [];
        const consequent = [];
  
        items.forEach((item, index) => {
          if (mask & (1 << index)) {
            antecedent.push(item);
          } else {
            consequent.push(item);
          }
        });
  
        const support = getSupport(items);
        const antecedentSupport = getSupport(antecedent);
        const consequentSupport = getSupport(consequent);
  
        if (antecedentSupport === 0 || consequentSupport === 0) {
          continue;
        }
  
        const confidence = support / antecedentSupport;
        const lift = confidence / consequentSupport;
  
        if (confidence >= minConfidence) {
          rules.push({
            antecedent,
            consequent,
            support,
            confidence,
            lift
          });
        }
      }
    }
  
    // Display stronger-confidence rules first.
    
rules.sort((a, b) =>
    b.lift - a.lift || b.confidence - a.confidence
  );
  
  
    return rules;
  }
  
  module.exports = generateAssociationRules;
  