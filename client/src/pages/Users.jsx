import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Users as UsersIcon } from "lucide-react";
import {
  fetchAllUsers, createAdmin, createUser,
  updateUserRole, deleteUser,
} from "../features/users/usersSlice";
import DashboardLayout from "../components/layout/DashboardLayout";
import Modal from "../components/common/Modal";
import ConfirmModal from "../components/common/ConfirmModal";
import Badge from "../components/common/Badge";
import Loader from "../components/common/Loader";
import Select from "../components/common/Select";
import PasswordInput from "../components/common/PasswordInput";
import useAuth from "../hooks/useAuth";

const INIT_FORM = { name: "", email: "", password: "" };

const Users = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.users);
  const { isSuperAdmin, user: currentUser } = useAuth();

  const [modal, setModal] = useState(null); // "admin" | "user" | null
  const [form, setForm] = useState(INIT_FORM);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const openModal = (type) => {
    setForm(INIT_FORM);
    setFormError("");
    setModal(type);
  };

  const closeModal = () => setModal(null);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    const action = modal === "admin" ? createAdmin(form) : createUser(form);
    const result = await dispatch(action);
    setSubmitting(false);
    if (result.meta.requestStatus === "fulfilled") closeModal();
    else setFormError(result.payload || "Something went wrong");
  };

  const handleRoleChange = (id, role) => {
    dispatch(updateUserRole({ id, role }));
  };

  const askDeleteUser = (user) => {
    setDeleteCandidate(user);
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteCandidate) return;
    setDeleting(true);
    await dispatch(deleteUser(deleteCandidate.id));
    setDeleting(false);
    setDeleteCandidate(null);
  };

  return (
    <DashboardLayout title="User Management">
      {/* Header row */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">All Users</h3>
          <p className="text-sm text-slate-500">{users.length} registered users</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={() => openModal("user")}
            className="min-h-11 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 sm:min-h-0"
          >
            + Create User
          </button>
          {isSuperAdmin && (
            <button
              type="button"
              onClick={() => openModal("admin")}
              className="min-h-11 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-700 sm:min-h-0"
            >
              + Create Admin
            </button>
          )}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* List / Table */}
      <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <Loader />
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <UsersIcon size={38} className="mb-2 text-slate-300" />
            <p className="text-sm">No users found</p>
          </div>
        ) : (
          <>
            {/* ── Mobile cards (< sm) ── */}
            <div className="divide-y divide-slate-100 sm:hidden">
              {users.map((u) => (
                <div key={u.id} className="p-4 space-y-3">
                  {/* Avatar + name row */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="font-semibold text-slate-800 leading-snug">{u.name}</p>
                        {u.id === currentUser?.id && (
                          <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">you</span>
                        )}
                      </div>
                      <p className="truncate text-xs text-slate-500 mt-0.5">{u.email}</p>
                    </div>
                    <Badge value={u.role} type="role" />
                  </div>

                  {/* Meta + actions */}
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-slate-400">
                      Joined <span className="text-slate-600">{new Date(u.created_at).toLocaleDateString()}</span>
                    </p>
                    {isSuperAdmin && u.id !== currentUser?.id && u.role !== "superadmin" && (
                      <div className="flex items-center gap-2">
                        <Select
                          width="w-24"
                          value={u.role}
                          onChange={(val) => handleRoleChange(u.id, val)}
                          options={[
                            { value: "user", label: "User" },
                            { value: "admin", label: "Admin" },
                          ]}
                        />
                        <button
                          type="button"
                          onClick={() => askDeleteUser(u)}
                          className="min-h-9 shrink-0 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Desktop table (sm+) ── */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">#</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Name</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Email</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Role</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Joined</th>
                    {isSuperAdmin && (
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map((u, idx) => (
                    <tr key={u.id} className="transition-colors hover:bg-slate-50/60">
                      <td className="px-5 py-3.5 text-slate-400">{idx + 1}</td>
                      <td className="px-5 py-3.5 font-medium text-slate-800">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="truncate">{u.name}</span>
                          {u.id === currentUser?.id && (
                            <span className="text-xs text-slate-400">(you)</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{u.email}</td>
                      <td className="px-5 py-3.5">
                        <Badge value={u.role} type="role" />
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      {isSuperAdmin && (
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            {u.id !== currentUser?.id && u.role !== "superadmin" && (
                              <Select
                                width="w-28"
                                value={u.role}
                                onChange={(val) => handleRoleChange(u.id, val)}
                                options={[
                                  { value: "user", label: "User" },
                                  { value: "admin", label: "Admin" },
                                ]}
                              />
                            )}
                            {u.id !== currentUser?.id && u.role !== "superadmin" && (
                              <button
                                type="button"
                                onClick={() => askDeleteUser(u)}
                                className="rounded px-2 py-1 text-xs font-medium text-red-500 transition hover:bg-red-50 hover:text-red-700"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Create User / Admin Modal */}
      <Modal
        isOpen={!!modal}
        onClose={closeModal}
        title={modal === "admin" ? "Create Admin" : "Create User"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{formError}</p>
          )}
          {["name", "email", "password"].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-slate-700 mb-1 capitalize">
                {field}
              </label>
              {field === "password" ? (
                <PasswordInput
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="Min. 6 characters"
                />
              ) : (
                <input
                  type={field === "email" ? "email" : "text"}
                  name={field}
                  value={form[field]}
                  onChange={handleChange}
                  required
                  placeholder=""
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}
            </div>
          ))}
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
              {submitting ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        onConfirm={handleDeleteConfirmed}
        title="Delete User"
        message={
          deleteCandidate
            ? `Are you sure you want to delete "${deleteCandidate.name}"? This action cannot be undone.`
            : "Are you sure you want to delete this user?"
        }
        confirmText="Delete"
        confirmVariant="danger"
        loading={deleting}
      />
    </DashboardLayout>
  );
};

export default Users;
