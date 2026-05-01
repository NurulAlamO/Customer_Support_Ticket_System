import React from 'react';

const AdminPanel = ({ currentUser, users, loadingUsers, onBack }) => {
  const customerCount = users.filter((user) => user.role === 'Customer').length;
  const supportCount = users.filter((user) => user.role === 'Support').length;
  const adminCount = users.filter((user) => user.role === 'Admin').length;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" className="btn w-full sm:w-auto" onClick={onBack}>
            Back to Dashboard
          </button>
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">
              Admin Panel
            </p>
            <p className="text-sm text-slate-500">{currentUser?.email}</p>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Customers</p>
            <p className="mt-3 text-4xl font-bold text-slate-900">{customerCount}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Support</p>
            <p className="mt-3 text-4xl font-bold text-slate-900">{supportCount}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Admins</p>
            <p className="mt-3 text-4xl font-bold text-slate-900">{adminCount}</p>
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">System Users</h1>
              <p className="mt-1 text-sm text-slate-600">
                Review all customer, support, and admin accounts from one place.
              </p>
            </div>
          </div>

          {loadingUsers ? (
            <p className="mt-6 text-slate-600">Loading users...</p>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th className="font-medium text-slate-900">Name</th>
                    <th className="font-medium text-slate-900">Email</th>
                    <th className="font-medium text-slate-900">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="font-medium text-slate-900">{user.name}</td>
                      <td className="font-medium text-slate-900">{user.email}</td>
                      <td>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {user.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default AdminPanel;
