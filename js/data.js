/* Chart Lab V2 — Data & Work Area Presets */
let data=[
  {Month:"Jan",Revenue:100000,Expenses:70000,Customers:120},
  {Month:"Feb",Revenue:115000,Expenses:72000,Customers:145},
  {Month:"Mar",Revenue:130000,Expenses:76000,Customers:160},
  {Month:"Apr",Revenue:142000,Expenses:79000,Customers:185},
  {Month:"May",Revenue:155000,Expenses:81000,Customers:205},
  {Month:"Jun",Revenue:168000,Expenses:85000,Customers:230}
];
let columns=Object.keys(data[0]);
let selectedSeries=["Revenue"];

const presets = {
  application: {
    headers: ["Month", "Year", "Received", "Approved", "In Process"],
    rows: [
      ["Jan", 2026, 42, 31, 11],
      ["Feb", 2026, 48, 36, 12],
      ["Mar", 2026, 55, 41, 14],
      ["Apr", 2026, 51, 39, 12],
      ["May", 2026, 63, 47, 16],
      ["Jun", 2026, 58, 44, 14]
    ]
  },
  revenue: {
    headers: ["Month", "Year", "Actual Collection", "Planned"],
    rows: [
      ["Jan", 2026, 185000, 200000],
      ["Feb", 2026, 194000, 205000],
      ["Mar", 2026, 207000, 210000],
      ["Apr", 2026, 219000, 215000],
      ["May", 2026, 231000, 225000],
      ["Jun", 2026, 248000, 240000]
    ]
  },
  maintenance: {
    headers: ["Month", "Year", "Budgeted", "Actual", "Industrial Sites"],
    rows: [
      ["Jan", 2026, 42000, 39800, 12],
      ["Feb", 2026, 44500, 43100, 14],
      ["Mar", 2026, 43800, 45200, 15],
      ["Apr", 2026, 47100, 45900, 16],
      ["May", 2026, 46200, 48100, 18],
      ["Jun", 2026, 48900, 47200, 19]
    ]
  },
  projects: {
    headers: ["Project Title", "Spend", "Actual", "Saved"],
    rows: [
      ["Industrial Site Upgrade", 850000, 820000, 30000],
      ["Road Improvement", 420000, 398000, 22000],
      ["Drainage Upgrade", 675000, 641000, 34000],
      ["Utility Expansion", 1200000, 1145000, 55000]
    ]
  },
  kpi: {
    headers: ["Target", "Actual Outcome", "% Achieved"],
    rows: [
      [100, 92, 92],
      [95, 88, 92.6],
      [90, 86, 95.6],
      [85, 79, 92.9]
    ]
  },
  others: {
    headers: ["Category", "Item", "Value", "Status"],
    rows: [
      ["Dummy A", "Example 1", 120, "Active"],
      ["Dummy B", "Example 2", 85, "Pending"],
      ["Dummy C", "Example 3", 150, "Completed"],
      ["Dummy D", "Example 4", 65, "Review"]
    ]
  }
};
