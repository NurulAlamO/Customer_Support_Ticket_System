import React from 'react';

const AuthPanel = ({
  mode,
  formData,
  onChange,
  onSubmit,
  onModeChange,
  submitting,
}) => {
  const isRegister = mode === 'register';

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900">
        {isRegister ? 'Create Your Account' : 'Log In'}
      </h2>
      <p className="mt-2 text-sm text-slate-700">
        {isRegister
          ? 'Register to create tickets, add comments, and manage your support requests.'
          : 'Log in to create tickets, add comments, and manage ticket status.'}
      </p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        {isRegister ? (
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
        ) : null}

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
          />
        </label>

        <label className="form-control w-full">
          <span className="label-text mb-2 block font-semibold text-slate-800">Password</span>
          <input
            className="input input-bordered w-full border-slate-300 text-slate-300 placeholder:text-slate-400"
            type="password"
            name="password"
            value={formData.password}
            onChange={onChange}
            placeholder="Enter your password"
            required
          />
        </label>

        {isRegister ? (
          <label className="form-control w-full">
            <span className="label-text mb-2 block font-semibold text-slate-800">Role</span>
            <select
              className="select select-bordered w-full border-slate-300 text-slate-900"
              name="role"
              value={formData.role}
              onChange={onChange}
            >
              <option value="Customer">Customer</option>
              <option value="Support">Support</option>
            </select>
          </label>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-700">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}
            {' '}
            <button
              type="button"
              className="font-semibold text-sky-700 hover:text-sky-800"
              onClick={() => onModeChange(isRegister ? 'login' : 'register')}
            >
              {isRegister ? 'Log in here' : 'Register here'}
            </button>
          </p>

          <button type="submit" className="btn btn-info min-w-32" disabled={submitting}>
            {submitting ? (isRegister ? 'Creating...' : 'Logging in...') : isRegister ? 'Register' : 'Log In'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuthPanel;
