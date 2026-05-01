import React from 'react';

const formatDate = (value) =>
  new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

const TicketDetails = ({
  ticket,
  currentUser,
  comments,
  loadingComments,
  commentMessage,
  onCommentChange,
  onSubmitComment,
  submittingComment,
  onToggleStatus,
  canManageStatus,
}) => {
  if (!ticket) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Ticket Details</h2>
        <p className="mt-4 text-slate-500">Select a ticket to review its details, comments, and status.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{ticket.title}</h2>
          <p className="mt-1 text-sm text-slate-500">{ticket.userName} - {ticket.userRole}</p>
        </div>

        {canManageStatus ? (
          <button
            type="button"
            className={`btn ${ticket.isOpen ? 'btn-success' : 'btn-outline'}`}
            onClick={() => onToggleStatus(ticket)}
            disabled={!currentUser}
          >
            {ticket.isOpen ? 'Close Ticket' : 'Reopen Ticket'}
          </button>
        ) : null}
      </div>

      {!currentUser ? (
        <p className="mt-3 text-sm text-slate-500">Log in to view and reply to ticket updates.</p>
      ) : !canManageStatus ? (
        <p className="mt-3 text-sm text-slate-500">Support controls are handled by the support team.</p>
      ) : null}

      <div className="mt-5 space-y-2 rounded-2xl bg-slate-50 p-4">
        <p className="text-sm text-slate-500">Priority</p>
        <p className="font-semibold text-slate-900">{ticket.priority}</p>
        <p className="text-sm text-slate-500 pt-2">Description</p>
        <p className="text-slate-700">{ticket.description}</p>
        <p className="text-sm text-slate-500 pt-2">Created</p>
        <p className="text-slate-700">{formatDate(ticket.createdAt)}</p>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">Comments</h3>
          <span className="text-sm text-slate-500">{comments.length} comments</span>
        </div>

        <form className="mt-4 space-y-3" onSubmit={onSubmitComment}>
          <textarea
            className="textarea textarea-bordered w-full min-h-28"
            value={commentMessage}
            onChange={(event) => onCommentChange(event.target.value)}
            placeholder={canManageStatus ? 'Write a support update' : 'Reply to the support team'}
            required
            disabled={!currentUser}
          />
          {!currentUser ? (
            <p className="text-sm text-slate-500">Log in to add a comment.</p>
          ) : null}
          <button type="submit" className="btn btn-info" disabled={submittingComment || !currentUser}>
            {submittingComment ? 'Posting...' : 'Add Comment'}
          </button>
        </form>

        <div className="mt-6 space-y-3">
          {loadingComments ? (
            <p className="text-slate-500">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-slate-500">No comments have been added to this ticket yet.</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="rounded-2xl border border-slate-200 p-4">
                <p className="text-slate-700">{comment.message}</p>
                <p className="mt-2 text-sm text-slate-400">{formatDate(comment.createdAt)}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
