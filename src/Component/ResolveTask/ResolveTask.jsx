import React from 'react';

const ResolveTask = ({ resolved = [], activeTicketId, onSelectTicket, onReopenTicket, role }) => {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold text-slate-900">
        {role === 'Support' ? 'Closed Tickets' : 'My Closed Tickets'}
      </h1>

      {resolved.length === 0 ? (
        <p className="mb-4 text-slate-600">There are no closed tickets yet.</p>
      ) : (
        resolved.map((ticket) => (
          <div
            key={ticket.id}
            className={`border p-3 mb-3 rounded-2xl ${
              activeTicketId === ticket.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'
            }`}
          >
            <button type="button" className="text-left w-full" onClick={() => onSelectTicket(ticket.id)}>
              <h2 className="text-xl font-bold text-slate-900">{ticket.title}</h2>
              <div className="mt-3 flex gap-4 text-sm text-slate-700">
                <p>{ticket.priority}</p>
                <p>{ticket.userName}</p>
              </div>
            </button>

            <button
              type="button"
              className="btn btn-outline btn-sm mt-4 w-full border-slate-300 text-slate-900 hover:border-slate-900 hover:bg-slate-900 hover:text-white"
              onClick={() => onReopenTicket(ticket.id)}
            >
              Reopen Ticket
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default ResolveTask;
