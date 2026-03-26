import { useEffect, lazy, Suspense, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CheckCircle2, ClipboardList, Clock3, ChevronLeft, ChevronRight, Inbox, LoaderCircle } from "lucide-react";
import { fetchRecentDelegations } from "../features/delegations/delegationsSlice";
import { fetchReports } from "../features/reports/reportsSlice";
import DashboardLayout from "../components/layout/DashboardLayout";
import Badge from "../components/common/Badge";
import Loader from "../components/common/Loader";
import useAuth from "../hooks/useAuth";

// Lazy-load chart — it's heavy, no need to load on first paint
const StatusPieChart = lazy(() => import("../components/charts/StatusPieChart"));

const StatCard = ({ label, value, color, icon }) => (
  <div className="flex min-h-[4.5rem] items-center gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-slate-500 text-sm">{label}</p>
      <p className="text-slate-800 text-2xl font-bold">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const { recentDelegations, recentLoading } = useSelector((state) => state.delegations);
  const { statusStats, loading: reportsLoading } = useSelector((state) => state.reports);
  const { user } = useAuth();

  const RECENT_PAGE_SIZE = 5;
  const [recentPage, setRecentPage] = useState(0);

  useEffect(() => {
    dispatch(fetchReports());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchRecentDelegations({
        limit: RECENT_PAGE_SIZE,
        offset: recentPage * RECENT_PAGE_SIZE,
      })
    );
  }, [dispatch, recentPage]);

  const statusMap = (statusStats || []).reduce((acc, s) => {
    acc[s.status] = Number(s.count) || 0;
    return acc;
  }, {});

  const counts = {
    pending: Number(statusMap.pending || 0),
    inProgress: Number(statusMap["in-progress"] || 0),
    completed: Number(statusMap.completed || 0),
    total:
      Number(statusMap.pending || 0) +
      Number(statusMap["in-progress"] || 0) +
      Number(statusMap.completed || 0),
  };

  const recent = recentDelegations || [];
  const hasNext = recent.length === RECENT_PAGE_SIZE;

  return (
    <DashboardLayout title="Dashboard">
      {/* Greeting */}
      <div className="mb-6">
        <h3 className="text-slate-800 text-xl font-semibold">
          Good day, {user?.name}
        </h3>
        <p className="text-slate-500 text-sm mt-1">
          Here&apos;s a quick overview of your delegations.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Delegations" value={counts.total} icon={<ClipboardList size={22} className="text-indigo-600" />} color="bg-indigo-50" />
        <StatCard label="Pending" value={counts.pending} icon={<Clock3 size={22} className="text-amber-600" />} color="bg-amber-50" />
        <StatCard label="In Progress" value={counts.inProgress} icon={<LoaderCircle size={22} className="text-blue-600" />} color="bg-blue-50" />
        <StatCard label="Completed" value={counts.completed} icon={<CheckCircle2 size={22} className="text-emerald-600" />} color="bg-emerald-50" />
      </div>

      {/* Chart + Recent Table */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pie Chart */}
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
          <h4 className="mb-4 font-semibold text-slate-700">Status Distribution</h4>
          {reportsLoading ? (
            <Loader />
          ) : (
            <Suspense fallback={<Loader />}>
              <StatusPieChart data={statusStats} />
            </Suspense>
          )}
        </div>

        {/* Recent Delegations */}
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
          <h4 className="mb-4 font-semibold text-slate-700">Recent Delegations</h4>
          {recentLoading ? (
            <Loader />
          ) : recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <Inbox size={36} className="mb-2 text-slate-300" />
              <p className="text-sm">No delegations assigned yet</p>
            </div>
          ) : (
            <div>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {recent.map((d) => (
                  <div
                    key={d.id}
                    className="flex min-h-12 items-center justify-between gap-3 border-b border-slate-50 py-2 last:border-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-700">
                        {d.title}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {d.assigned_to_name || "Unassigned"}
                      </p>
                    </div>
                    <Badge value={d.status} />
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setRecentPage((p) => Math.max(0, p - 1))}
                  disabled={recentPage === 0}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft size={16} />
                  Prev
                </button>

                <p className="text-xs text-slate-500">
                  Page <span className="font-semibold text-slate-700">{recentPage + 1}</span>
                </p>

                <button
                  type="button"
                  onClick={() => setRecentPage((p) => p + 1)}
                  disabled={!hasNext}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
