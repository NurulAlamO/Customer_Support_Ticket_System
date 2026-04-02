import React from 'react';

const ResolveTask = ({resolved = []}) => {
    return (
        <div className='p-4'>
            <h1 className='text-2xl font-bold mb-4'>Resolved Task</h1>
            {resolved.length === 0 ? (
                <p className='mb-4'>No resolved tasks yet.</p>
                ) : (
                    resolved.map(resolve =>
                        <div key={resolve.id} className='border p-2 
                        mb-2 rounded'>
                            <h2 className='text-xl font-bold'>{resolve.title}</h2>
                            <div className='flex mt-3 gap-4'>
                                <p>{resolve.productId}</p>
                                <p>{resolve.name}</p>
                            </div>
                        </div>
                    )
            )}
        </div>
    );
};

export default ResolveTask;