import React from 'react';
import TaskStatus from '../TaskStatus/TaskStatus';

const TaskCard = ({ inProgress, handleComplete, activeTicketId, onSelectTicket }) => {
  return (
    <div className="p-4">
      <h2 className="mb-4 text-xl font-bold text-slate-900">Support Actions</h2>
      <TaskStatus
        inProgress={inProgress}
        handleComplete={handleComplete}
        activeTicketId={activeTicketId}
        onSelectTicket={onSelectTicket}
      />
    </div>
  );
};

export default TaskCard;
