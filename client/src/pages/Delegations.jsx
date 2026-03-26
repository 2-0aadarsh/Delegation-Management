import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ClipboardList } from "lucide-react";
import {
  fetchDelegations, createDelegation,
  updateDelegationStatus, deleteDelegation,
} from "../features/delegations/delegationsSlice";
import { fetchAllUsers } from "../features/users/usersSlice";
import DashboardLayout from "../components/layout/DashboardLayout";
import Modal from "../components/common/Modal";
import Badge from "../components/common/Badge";
import Loader from "../components/common/Loader";
import Select from "../components/common/Select";
import useAuth from "../hooks/useAuth";

const STATUS_OPTIONS = ["pending", "in-progress", "completed"];

const INIT_FORM = { title: "", description: "", assigned_to: "" };

const Delegations = () => {
  const dispatch = useDispatch();
  const { delegations, loading, error } = useSelector((s) => s.delegations);
  const { users } = useSelector((s) => s.users);
  const { user, isSuperAdmin, isAdmin, isAdminLevel } = useAuth();

  const canUpdateDelegationStatus = (d) => {
    if (isSuperAdmin) return true;
    if (isAdmin && user?.id != null) {
      const uid = Number(user.id);
      return Number(d.created_by) === uid || Number(d.assigned_to) === uid;
    }
    return true;
  };

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(INIT_FORM);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchDelegations());
    if (isAdminLevel) dispatch(fetchAllUsers()); // need user list for assign dropdown
  }, [dispatch, isAdminLevel]);

  const openModal = () => { setForm(INIT_FORM); setFormError(""); setShowModal(true); };
  const closeModal = () => setShowModal(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    const result = await dispatch(createDelegation(form));
    setSubmitting(false);
    if (result.meta.requestStatus === "fulfilled") closeModal();
    else setFormError(result.payload || "Failed to create delegation");
  };

  const handleStatusChange = (id, status) => {
    dispatch(updateDelegationStatus({ id, status }));
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this delegation?")) dispatch(deleteDelegation(id));
  };

  return (
    <DashboardLayout title="Delegations">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">All Delegations</h3>
          <p className="text-sm text-slate-500">{delegations.length} total</p>
        </div>
        {isAdminLevel && (
          <button
            type="button"
            onClick={openModal}
            className="min-h-11 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 sm:w-auto sm:min-h-0"
          >
            + Assign Delegation
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* List / Table */}
      <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <Loader />
        ) : delegations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <ClipboardList size={38} className="mb-2 text-slate-300" />
            <p className="text-sm">No delegations found</p>
          </div>
        ) : (
          <>
            {/* ── Mobile cards (< sm) ── */}
            <div className="divide-y divide-slate-100 sm:hidden">
              {delegations.map((d) => {
                const statusLabel = (s) =>
                  s === "in-progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1);
                return (
                  <div key={d.id} className="p-4 space-y-3">
                    {/* Title + badge row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-800 leading-snug">{d.title}</p>
                        {d.description && (
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{d.description}</p>
                        )}
                      </div>
                      <Badge value={d.status} />
                    </div>

                    {/* Meta grid */}
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                      <div>
                        <p className="text-slate-400 uppercase tracking-wide text-[10px] font-medium">Assigned to</p>
                        <p className="text-slate-700 font-medium mt-0.5">{d.assigned_to_name || "—"}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 uppercase tracking-wide text-[10px] font-medium">Created by</p>
                        <p className="text-slate-700 font-medium mt-0.5">{d.created_by_name || "—"}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 uppercase tracking-wide text-[10px] font-medium">Date</p>
                        <p className="text-slate-700 font-medium mt-0.5">{new Date(d.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Actions row */}
                    <div className="flex items-center gap-2 pt-1">
                      <div className="flex-1">
                        {canUpdateDelegationStatus(d) ? (
                          <Select
                            value={d.status}
                            onChange={(val) => handleStatusChange(d.id, val)}
                            options={STATUS_OPTIONS.map((s) => ({ value: s, label: statusLabel(s) }))}
                          />
                        ) : (
                          <p
                            className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-500"
                            title="Only the creator or assignee can change status"
                          >
                            Status is read-only for this delegation
                          </p>
                        )}
                      </div>
                      {isSuperAdmin && (
                        <button
                          type="button"
                          onClick={() => handleDelete(d.id)}
                          className="min-h-10 shrink-0 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-500 transition hover:bg-red-50 hover:text-red-700"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Desktop table (sm+) ── */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">#</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Title</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Assigned To</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Created By</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {delegations.map((d, idx) => (
                    <tr key={d.id} className="transition-colors hover:bg-slate-50/60">
                      <td className="px-5 py-3.5 text-slate-400">{idx + 1}</td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-slate-800">{d.title}</p>
                        {d.description && (
                          <p className="mt-0.5 max-w-48 truncate text-xs text-slate-400">{d.description}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{d.assigned_to_name || "—"}</td>
                      <td className="px-5 py-3.5 text-slate-600">{d.created_by_name || "—"}</td>
                      <td className="px-5 py-3.5">
                        <Badge value={d.status} />
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {new Date(d.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          {canUpdateDelegationStatus(d) ? (
                            <Select
                              width="w-32"
                              value={d.status}
                              onChange={(val) => handleStatusChange(d.id, val)}
                              options={STATUS_OPTIONS.map((s) => ({
                                value: s,
                                label: s === "in-progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1),
                              }))}
                            />
                          ) : (
                            <span
                              className="text-xs text-slate-400"
                              title="You can only update delegations you created or that are assigned to you"
                            >
                              —
                            </span>
                          )}
                          {isSuperAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDelete(d.id)}
                              className="rounded px-2 py-1 text-xs font-medium text-red-500 transition hover:bg-red-50 hover:text-red-700"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Create Delegation Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title="Assign New Delegation">
        <form onSubmit={handleCreate} className="space-y-4">
          {formError && (
            <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{formError}</p>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Assign To</label>
            <Select
              width="w-full"
              value={form.assigned_to}
              onChange={(val) => setForm((prev) => ({ ...prev, assigned_to: val }))}
              placeholder="Select a user..."
              options={users.map((u) => ({
                value: String(u.id),
                label: u.name,
                subLabel: u.role === "superadmin" ? "Super Admin" : u.role.charAt(0).toUpperCase() + u.role.slice(1),
              }))}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              {submitting ? "Assigning..." : "Assign"}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default Delegations;
