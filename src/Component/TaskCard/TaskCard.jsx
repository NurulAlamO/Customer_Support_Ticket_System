import React from 'react';
import TaskStatus from '../TaskStatus/TaskStatus';

const TaskCard = ({inProgress, handleComplete}) => {
    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Task Status</h2>
            <TaskStatus inProgress={inProgress}
                handleComplete={handleComplete}
            ></TaskStatus>
        </div>
    );
};

export default TaskCard;