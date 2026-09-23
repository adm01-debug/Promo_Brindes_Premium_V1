/**
 * The implementation plan is an internal development tool. It is opt-in and
 * can never be enabled in a deployed Vercel environment.
 */
export function allowsPlanningDashboard(
  enabled = process.env.PROMO_PREMIUM_PLANNING_ENABLED,
  vercelEnvironment = process.env.VERCEL_ENV,
) {
  return (
    enabled === "true" &&
    (!vercelEnvironment || vercelEnvironment === "development")
  );
}
