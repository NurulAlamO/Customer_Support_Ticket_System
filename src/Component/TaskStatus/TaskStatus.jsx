import React from 'react';

const TaskStatus = ({inProgress, handleComplete}) => {
    // console.log(inProgress)
    return (
        <div>
            {inProgress.length === 0 ? (
                <p className='mb-4'>Select a ticket to add to Task Status</p>
                ) : (
                    inProgress.map(task =>
                        <div key={task.id} className='border p-2 mb-2 rounded'>
                            <p className='text-2xl font-bold'>{task.title}</p>
                            <button 
                                className='bg-green-500 text-white px-2 py-1 mt-4 rounded w-full'
                                onClick={() => handleComplete(task.id)}>
                                Complete
                            </button>
                        </div>
                    )
            )}
        </div>
       
    );
};

export default TaskStatus;