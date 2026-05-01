import React from 'react';
import TicketCard from '../TicketCard/TicketCard';

const TicketList = ({ tickets, handleAddToProgress, selectedTicketId, loading, role }) => {
  const activeTickets = tickets.filter((ticket) => ticket.isOpen);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-slate-900">
        {role === 'Support' ? 'Open Support Tickets' : 'My Open Tickets'}
      </h1>

      {loading ? (
        <p className="text-slate-600">Loading tickets...</p>
      ) : activeTickets.length === 0 ? (
        <p className="text-slate-600">
          {role === 'Support'
            ? 'No open tickets match the selected priority.'
            : 'You do not have any open tickets matching the selected priority.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeTickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              handleAddToProgress={handleAddToProgress}
              isActive={selectedTicketId === ticket.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketList;
