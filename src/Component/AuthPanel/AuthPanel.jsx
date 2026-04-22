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
  const isForgotPassword = mode === 'forgotPassword';

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900">
        {isRegister ? 'Create Your Account' : isForgotPassword ? 'Reset Your Password' : 'Log In'}
      </h2>
      <p className="mt-2 text-sm text-slate-700">
        {isRegister
          ? 'Register to create tickets, add comments, and manage your support requests.'
          : isForgotPassword
            ? 'Enter your account email and choose a new password to regain access.'
            : 'Log in to create tickets, add comments, and manage ticket status.'}
      </p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        {isRegister ? (
          <label className="form-control w-full">
            <span className="label-text mb-2 block font-semibold 
              text-slate-800">Full Name</span>
            <input
              className="input input-bordered w-full 
                border-slate-300 text-slate-300 
                placeholder:text-slate-400"
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
          <span className="label-text mb-2 block font-semibold 
            text-slate-800">Email</span>
          <input
            className="input input-bordered w-full border-slate-300 
              text-slate-300 placeholder:text-slate-400"
            type="email"
            name="email"
            value={formData.email}
            onChange={onChange}
            placeholder="Enter your email"
            required
          />
        </label>

        <label className="form-control w-full">
          <span className="label-text mb-2 block font-semibold 
            text-slate-800">Password</span>
          <input
            className="input input-bordered w-full border-slate-300 
              text-slate-300 placeholder:text-slate-400"
            type="password"
            name="password"
            value={formData.password}
            onChange={onChange}
            placeholder={isForgotPassword ? 'Enter your new password' : 'Enter your password'}
            required
          />
        </label>

        {isRegister ? (
          <label className="form-control w-full">
            <span className="label-text mb-2 block font-semibold 
              text-slate-800">Role</span>
            <select
              className="select select-bordered w-full 
                border-slate-300 text-slate-300"
              name="role"
              value={formData.role}
              onChange={onChange}
            >
              <option value="Customer">Customer</option>
              <option value="Support">Support</option>
            </select>
          </label>
        ) : null}

        <div className="justify-center text-center gap-3 border-t 
          border-slate-200 pt-4 sm:flex-row sm:items-center 
            sm:justify-between">
          <div className="space-y-2 text-sm text-slate-700">
            
             {!isRegister ? (
              <p>
                Forgot your password?
                {' '}
                <button
                  type="button"
                  className="font-semibold text-sky-700 hover:text-sky-800"
                  onClick={() => onModeChange(isForgotPassword ? 'login' : 'forgotPassword')}
                >
                  {isForgotPassword ? 'Back to login' : 'Reset'}
                </button>
              </p>
            ) : null}
            
            <p>
              {isRegister
                ? 'Already have an account?'
                : isForgotPassword
                  ? 'Remembered your password?'
                  : "Don't have an account?"}
              {' '}
              <button
                type="button"
                className="font-semibold text-sky-700 
                hover:text-sky-800"
                onClick={() => onModeChange(isRegister ? 'login' : 'register')}
              >
                {isRegister ? 'Log' : isForgotPassword ? 'Log' : 'Register'}
              </button>
            </p>

          </div>

          <button type="submit" className="btn btn-info 
            min-w-32 mt-3" disabled={submitting}>
            {submitting
              ? isRegister
                ? 'Creating...'
                : isForgotPassword
                  ? 'Resetting...'
                  : 'Logging in...'
              : isRegister
                ? 'Register'
                : isForgotPassword
                  ? 'Reset Password'
                  : 'Login'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuthPanel;
