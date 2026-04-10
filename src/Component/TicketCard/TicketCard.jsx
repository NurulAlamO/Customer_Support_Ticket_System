import React from 'react';

const priorityClasses = {
  High: 'text-red-500',
  Medium: 'text-amber-500',
  Low: 'text-emerald-500',
};

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const TicketCard = ({ ticket, handleAddToProgress, isActive }) => {
  return (
    <div
      className={`border p-4 rounded-2xl shadow-sm cursor-pointer transition hover:shadow-lg ${
        isActive ? 'border-sky-500 bg-sky-50' : 'border-slate-200 bg-white'
      }`}
      onClick={() => handleAddToProgress(ticket.id)}
    >
      <div className="flex justify-between items-start gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{ticket.title}</h1>
          <p className="text-sm text-slate-500">{ticket.userName} - {ticket.userRole}</p>
        </div>

        <button
          type="button"
          className={ticket.isOpen ? 'bg-green-300 text-black px-4 rounded-xl' : 'bg-yellow-200 text-black px-4 rounded-xl'}
        >
          {ticket.isOpen ? 'Open' : 'Closed'}
        </button>
      </div>

      <p className="pt-4 text-slate-600">{ticket.description}</p>

      <div className="flex justify-between items-center pt-4 gap-3 text-sm">
        <div className="flex gap-2 items-center">
          <span className="rounded-full bg-slate-100 px-3 py-1">{ticket.priority}</span>
          <span className={priorityClasses[ticket.priority]}>{ticket.priority} Priority</span>
        </div>

        <div className="text-right text-slate-500">
          <p>{Number(ticket.commentsCount || 0)} comment{Number(ticket.commentsCount || 0) === 1 ? '' : 's'}</p>
          <p>{formatDate(ticket.createdAt)}</p>
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
