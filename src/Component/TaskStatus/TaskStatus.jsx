import React from 'react';

const TaskStatus = ({ inProgress, handleComplete, activeTicketId, onSelectTicket }) => {
  return (
    <div>
      {inProgress.length === 0 ? (
        <p className="mb-4 text-slate-600">There are no open tickets right now.</p>
      ) : (
        inProgress.map((task) => (
          <div
            key={task.id}
            className={`border p-3 mb-3 rounded-2xl ${
              activeTicketId === task.id ? 'border-sky-500 bg-sky-50' : 'border-slate-200'
            }`}
          >
            <button type="button" className="text-left w-full" onClick={() => onSelectTicket(task.id)}>
              <p className="text-xl font-bold text-slate-900">{task.title}</p>
              <p className="text-sm text-slate-600">{task.userName}</p>
            </button>

            <button
              className="bg-green-500 text-white px-2 py-2 mt-4 rounded-xl w-full"
              onClick={() => handleComplete(task.id)}
              type="button"
            >
              Close Ticket
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default TaskStatus;
