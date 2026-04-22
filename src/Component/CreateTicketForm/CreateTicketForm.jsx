import React from 'react';

const CreateTicketForm = ({ currentUser, formData, onChange, onSubmit, submitting }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900">Create a Ticket</h2>
      <p className="mt-2 text-sm text-slate-500">
        Submit a new support request and save it to the database.
      </p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <label className="form-control w-full">
          <span className="label-text font-semibold mb-2 block">Title</span>
          <input
            className="input input-bordered w-full"
            type="text"
            name="title"
            value={formData.title}
            onChange={onChange}
            placeholder="Ticket title"
            required
          />
        </label>

        <label className="form-control w-full">
          <span className="label-text font-semibold mb-2 block">Description</span>
          <textarea
            className="textarea textarea-bordered w-full min-h-32"
            name="description"
            value={formData.description}
            onChange={onChange}
            placeholder="Describe the customer issue"
            required
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="form-control w-full">
            <span className="label-text font-semibold mb-2 block">Priority</span>
            <select
              className="select select-bordered w-full"
              name="priority"
              value={formData.priority}
              onChange={onChange}
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </label>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-500">Signed-in User</p>
            {currentUser ? (
              <>
                <p className="mt-2 font-semibold text-slate-900">{currentUser.name}</p>
                {/* <p className="text-sm text-slate-600">{currentUser.email}</p> */}
              </>
            ) : (
              <p className="mt-2 text-sm text-slate-500">Log in to create a ticket.</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
          <p className="text-sm text-slate-500">
            Fill in the details and create a new customer support ticket.</p>
          <button
            type="submit"
            className="btn btn-info min-w-32"
            disabled={submitting || !currentUser}
          >
            {submitting ? 'Saving...' : 'Add Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTicketForm;