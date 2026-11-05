
import "server-only";

import { getTenantContext } from "@/lib/auth/tenant";
import { getDashboardStats } from "@/lib/services/dashboard/get-dashboard-stats";
import { getLowStockProducts } from "@/lib/services/dashboard/get-low-stock-products";
import { getOrganizationSettings } from "@/lib/services/organizations/get-organization-settings";

export async function getAIContext() {
  // Identify the authenticated user and organization.
  const { role } = await getTenantContext();

  // Load business information using existing services.
  const [stats, lowStockProducts, organization] =
    await Promise.all([
      getDashboardStats(),
      getLowStockProducts(),
      getOrganizationSettings(),
    ]);

  if (!organization) {
    throw new Error("Organization unavailable");
  }

  // Only include financial data for authorized admins.
  const statistics =
    role === "ADMIN" && stats.canViewFinancials
      ? {
          totalSales: stats.totalSales,
          totalRevenue: stats.totalRevenue,
          totalCost: stats.totalCost,
          totalProfit: stats.totalProfit,
        }
      : {
          totalSales: stats.totalSales,
          totalRevenue: stats.totalRevenue,
        };

  // Return only approved fields to the AI model.
  return {
    organization: {
      name: organization.name,
      currency: organization.currency,
      locale: organization.locale,
    },

    user: {
      role,
    },

    statisticsPeriod: "all_time",

    statistics,

    lowStockProducts: lowStockProducts.map(
      (product) => ({
        name: product.name,
        sku: product.sku,
        stockQuantity: product.stockQuantity,
        lowStockThreshold: product.lowStockThreshold,
      })
    ),

    lowStockResultsLimitedTo: 5,
  };
}
