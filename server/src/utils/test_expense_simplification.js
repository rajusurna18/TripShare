import { calculateSimplifiedTransactionsService } from "../modules/expense/expense.service.js";

const runTests = () => {
  console.log("Starting Debt Simplification Algorithm Unit Tests...\n");

  // TEST case 1: 3 members, 2 debtors, 1 creditor
  const balancesData1 = {
    balances: [
      { user: "A", balance: 600, paid: 1000 },
      { user: "B", balance: -400, paid: 0 },
      { user: "C", balance: -200, paid: 200 }
    ]
  };

  const results1 = calculateSimplifiedTransactionsService(balancesData1);
  console.log("Test Case 1 Transactions:", JSON.stringify(results1));

  if (
    results1.length === 2 &&
    results1.some(t => t.from === "B" && t.to === "A" && t.amount === 400) &&
    results1.some(t => t.from === "C" && t.to === "A" && t.amount === 200)
  ) {
    console.log("[PASS] Test Case 1: Properly settled 2 debtors with 1 creditor.");
  } else {
    console.error("[FAIL] Test Case 1: Incorrect transactions computed.");
    process.exit(1);
  }

  // TEST case 2: Chain Debt settlement (A owes B, B owes C, C owes A) => Net settled should be empty
  const balancesData2 = {
    balances: [
      { user: "A", balance: 0, paid: 500 },
      { user: "B", balance: 0, paid: 500 },
      { user: "C", balance: 0, paid: 500 }
    ]
  };
  const results2 = calculateSimplifiedTransactionsService(balancesData2);
  console.log("Test Case 2 Transactions:", JSON.stringify(results2));
  if (results2.length === 0) {
    console.log("[PASS] Test Case 2: Zero net differences result in no transactions.");
  } else {
    console.error("[FAIL] Test Case 2: Found transactions for fully balanced ledger.");
    process.exit(1);
  }

  // TEST case 3: 4 members, complex settlements
  const balancesData3 = {
    balances: [
      { user: "A", balance: 500 },
      { user: "B", balance: 250 },
      { user: "C", balance: -600 },
      { user: "D", balance: -150 }
    ]
  };
  const results3 = calculateSimplifiedTransactionsService(balancesData3);
  console.log("Test Case 3 Transactions:", JSON.stringify(results3));
  // Largest debtor C (600) settles with largest creditor A (500) -> C pays A 500. A settled. C remaining debt = 100.
  // Next C (100) settles with B (250) -> C pays B 100. C settled. B remaining credit = 150.
  // Last D (150) settles with B (150) -> D pays B 150. All settled.
  if (
    results3.length === 3 &&
    results3[0].from === "C" && results3[0].to === "A" && results3[0].amount === 500 &&
    results3[1].from === "C" && results3[1].to === "B" && results3[1].amount === 100 &&
    results3[2].from === "D" && results3[2].to === "B" && results3[2].amount === 150
  ) {
    console.log("[PASS] Test Case 3: Complex multi-debtor/creditor path simplified successfully.");
  } else {
    console.error("[FAIL] Test Case 3: Complex calculations returned incorrect parameters.");
    process.exit(1);
  }

  console.log("\nAll Debt Simplification tests passed successfully! 🚀");
};

runTests();
