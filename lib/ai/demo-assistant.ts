
import { formatMoney } from "@/lib/utils/money";

type DemoContext = {
  user: {
    role: string;
  };

  organization: {
    name: string;
    currency: string;
    locale: string;
  };

  statisticsPeriod: string;

  statistics: {
    totalSales: number;
    totalRevenue: number;
    totalCost?: number;
    totalProfit?: number;
  };

  lowStockProducts: Array<{
    name: string;
    sku?: string | null;
    stockQuantity: number;
    lowStockThreshold: number;
  }>;

  lowStockResultsLimitedTo: number;
};

export function getDemoResponse(
  message: string,
  context: DemoContext
): string {
  const question = message.toLowerCase().trim();

  const {
    statistics,
    organization,
    lowStockProducts,
  } = context;

  // Use the same currency formatter as the dashboard.
  const formatCurrency = (amount: number): string => {
    return formatMoney(
      amount,
      organization.currency,
      organization.locale
    );
  };

  // Handle sales and revenue questions.
  if (
    question.includes("revenue") ||
    question.includes("total sales") ||
    question.includes("sales performance") ||
    question.includes("how much have we sold") ||
    question.includes("how many sales") ||
    question.includes("transactions")
  ) {
    return [
      "Sales Overview (All Time)",
      "",
      `Total transactions: ${statistics.totalSales}`,
      `Total revenue: ${formatCurrency(statistics.totalRevenue)}`,
      "",
      "These figures are based on your organization's available data.",
    ].join("\n");
  }

  // Handle profit and cost questions for admins.
  if (
    question.includes("profit") ||
    question.includes("cost") ||
    question.includes("purchase price") ||
    question.includes("financial overview")
  ) {
    if (
      context.user.role !== "ADMIN" ||
      statistics.totalProfit === undefined ||
      statistics.totalCost === undefined
    ) {
      return [
        "Access Restricted",
        "",
        "You do not have permission to view",
        "cost or profit information.",
        "",
        "Please contact your administrator",
        "if you need access.",
      ].join("\n");
    }

    return [
      "Financial Overview (All Time)",
      "",
      `Total transactions: ${statistics.totalSales}`,
      `Total revenue: ${formatCurrency(statistics.totalRevenue)}`,
      `Total cost: ${formatCurrency(statistics.totalCost)}`,
      `Total profit: ${formatCurrency(statistics.totalProfit)}`,
      "",
      "These figures are based on completed sales.",
    ].join("\n");
  }

  // Handle inventory and low-stock questions.
  if (
    question.includes("stock") ||
    question.includes("inventory") ||
    question.includes("out of stock")
  ) {
    if (lowStockProducts.length === 0) {
      return [
        "Inventory Overview",
        "",
        "No low-stock products were found",
        "in the available inventory results.",
        "",
        "Your inventory currently has no",
        "reported low-stock alerts.",
      ].join("\n");
    }

    return [
      "Low Stock Products",
      "",
      ...lowStockProducts.map(
        (product, index) =>
          `${index + 1}. ${product.name}\n` +
          `   SKU: ${product.sku || "N/A"}\n` +
          `   Available: ${product.stockQuantity} units\n` +
          `   Alert threshold: ${product.lowStockThreshold} units`
      ),
      "",
      `Showing up to ${context.lowStockResultsLimitedTo} products.`,
      "",
      "Consider reviewing these products",
      "and planning inventory replenishment.",
    ].join("\n");
  }

  // Explain how to register a sale.
  if (
    question.includes("register a sale") ||
    question.includes("create a sale") ||
    question.includes("new sale") ||
    question.includes("add a sale")
  ) {
    return [
      "How to Register a Sale",
      "",
      "1. Open the Sales page from the sidebar.",
      "2. Click the option to create a new sale.",
      "3. Select the products being sold.",
      "4. Enter the quantity for each product.",
      "5. Review the transaction details.",
      "6. Confirm and save the sale.",
      "",
      "The transaction will be recorded",
      "in your sales history.",
    ].join("\n");
  }

  // Provide general business recommendations.
  if (
    question.includes("improve") ||
    question.includes("recommendation") ||
    question.includes("advice") ||
    question.includes("increase sales")
  ) {
    return [
      "Sales Improvement Suggestions",
      "",
      "1. Monitor your best-selling products.",
      "2. Review inventory levels regularly.",
      "3. Identify products with high demand.",
      "4. Analyze sales performance over time.",
      "5. Keep product prices up to date.",
      "6. Avoid running out of popular products.",
      "7. Review customer purchasing patterns.",
      "",
      "These are general recommendations",
      "provided by ALIF Demo Mode.",
    ].join("\n");
  }

  // Handle basic greetings.
  if (
    question === "hello" ||
    question === "hi" ||
    question === "hey"
  ) {
    return [
      "Hello! Welcome to ALIF AI Assistant.",
      "",
      `Organization: ${organization.name}`,
      "",
      "I can help you explore sales,",
      "inventory, and ALIF features.",
      "",
      "What would you like to know?",
    ].join("\n");
  }

  // Handle help requests.
  if (
    question.includes("help") ||
    question.includes("what can you do")
  ) {
    return [
      "ALIF AI Assistant - Demo Mode",
      "",
      "Available Features:",
      "",
      "- View total sales and revenue",
      "- Check low-stock products",
      "- View financial information (ADMIN only)",
      "- Learn how to register sales",
      "- Get general business recommendations",
      "",
      "This demo uses predefined responses",
      "and authorized organization data.",
    ].join("\n");
  }

  // Default response for unsupported questions.
  return [
    "ALIF AI Assistant - Demo Mode",
    "",
    "I am currently running in Demo Mode.",
    "",
    "You can ask questions such as:",
    "",
    "- What is our total revenue?",
    "- How many sales have we completed?",
    "- Which products are low on stock?",
    "- What is our total profit?",
    "- How do I register a sale?",
    "- How can we improve our sales?",
    "",
    "Advanced AI conversations will be",
    "available when OpenAI is enabled.",
  ].join("\n");
}
