import React from 'react';

const AccountSettings = ({
  currentUser,
  formData,
  onChange,
  onSubmit,
  onDeleteAccount,
  onBack,
  submittingProfile,
  deletingAccount,
  isStaff,
}) => (
  <main className="min-h-screen bg-slate-100 px-4 py-10">
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" className="btn  w-full sm:w-auto" onClick={onBack}>
          Back to Dashboard
        </button>
        <div className="text-center sm:text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-600">
            Account Settings
          </p>
          <p className="text-sm text-slate-500">{currentUser?.role || 'User'} account</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[32px] bg-gradient-to-br from-sky-900 via-sky-700 to-emerald-500 p-8 text-white shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-100">
            Manage Your Profile
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight">
            Keep your account details up to date.
          </h1>
          <p className="mt-4 text-sm text-white/90">
            {isStaff
              ? 'Your staff login email and password are managed by the developer. You can still update your display name for the workspace.'
              : 'Update the information shown on your workspace, or permanently remove your account if you no longer want to use this system.'}
          </p>

          <div className="mt-8 space-y-4">
            <div className="rounded-2xl bg-white/16 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-sky-100">Current Name</p>
              <p className="mt-2 text-xl font-semibold">{currentUser?.name || 'User'}</p>
            </div>
            <div className="rounded-2xl bg-white/16 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-sky-100">Current Email</p>
              <p className="mt-2 break-all text-base font-medium">{currentUser?.email || '-'}</p>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Update your profile</h2>
            <p className="mt-2 text-sm text-slate-600">
              Change your display name or email address, or permanently remove your account.
            </p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <label className="form-control w-full">
              <span className="label-text mb-2 block font-semibold text-slate-800">Full Name</span>
              <input
                className="input input-bordered w-full border-slate-300 text-slate-300 placeholder:text-slate-400"
                type="text"
                name="name"
                value={formData.name}
                onChange={onChange}
                placeholder="Enter your full name"
                required
              />
            </label>

            <label className="form-control w-full">
              <span className="label-text mb-2 block font-semibold text-slate-800">Email</span>
              <input
                className="input input-bordered w-full border-slate-300 text-slate-300 placeholder:text-slate-400"
                type="email"
                name="email"
                value={formData.email}
                onChange={onChange}
                placeholder="Enter your email"
                required
                disabled={isStaff}
              />
            </label>

            <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <button type="submit" className="btn btn-info min-w-36" disabled={submittingProfile}>
                {submittingProfile ? 'Saving...' : 'Save Profile'}
              </button>

              {isStaff ? (
                <p className="text-sm text-slate-500">Staff credentials can only be changed by the developer.</p>
              ) : (
                <button
                  type="button"
                  className="btn btn-outline btn-error"
                  onClick={onDeleteAccount}
                  disabled={deletingAccount}
                >
                  {deletingAccount ? 'Deleting...' : 'Delete Account'}
                </button>
              )}
            </div>
          </form>
        </section>
      </div>
    </div>
  </main>
);

export default AccountSettings;
