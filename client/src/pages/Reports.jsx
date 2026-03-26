import { useEffect, lazy, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReports } from "../features/reports/reportsSlice";
import DashboardLayout from "../components/layout/DashboardLayout";
import Loader from "../components/common/Loader";
import useAuth from "../hooks/useAuth";

// Heavy chart components — lazy-loaded to split them out of the main bundle
const StatusPieChart = lazy(() => import("../components/charts/StatusPieChart"));
const UserBarChart   = lazy(() => import("../components/charts/UserBarChart"));
const TimeLineChart  = lazy(() => import("../components/charts/TimeLineChart"));

const ChartCard = ({ title, subtitle, children }) => (
  <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
    <div className="mb-4">
      <h4 className="font-semibold text-slate-700">{title}</h4>
      {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
    </div>
    <Suspense fallback={<Loader />}>{children}</Suspense>
  </div>
);

const Reports = () => {
  const dispatch = useDispatch();
  const { statusStats, userStats, timeStats, loading, error } = useSelector(
    (s) => s.reports
  );
  const { isAdminLevel, isSuperAdmin } = useAuth();

  useEffect(() => {
    dispatch(fetchReports());
  }, [dispatch]);

  if (loading) return <DashboardLayout title="Reports"><Loader /></DashboardLayout>;

  return (
    <DashboardLayout title="Reports">
      <div className="mb-6">
        <h3 className="text-slate-800 font-semibold text-lg">Analytics Overview</h3>
        <p className="text-slate-500 text-sm">
          {isSuperAdmin
            ? "System-wide delegation statistics"
            : isAdminLevel
            ? "System-wide status and timeline; per-user workload chart is available to super admins only"
            : "Your personal delegation statistics"}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Summary stat pills */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {statusStats.map((s) => (
          <div
            key={s.status}
            className="flex min-h-[3.25rem] items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm sm:px-5"
          >
            <span className="text-2xl font-bold text-slate-800">{s.count}</span>
            <span className="text-sm text-slate-500 capitalize">{s.status}</span>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ChartCard
          title="Status Distribution"
          subtitle="Breakdown of delegations by current status"
        >
          <StatusPieChart data={statusStats} />
        </ChartCard>

        <ChartCard
          title="Delegations Over Time"
          subtitle="How delegations have been created over time"
        >
          <TimeLineChart data={timeStats} />
        </ChartCard>

        {/* User workload bar chart — superadmin only (requires system-wide user data) */}
        {isSuperAdmin && (
          <div className="md:col-span-2">
            <ChartCard
              title="User Workload"
              subtitle="Total delegations assigned per team member"
            >
              <UserBarChart data={userStats} />
            </ChartCard>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Reports;
