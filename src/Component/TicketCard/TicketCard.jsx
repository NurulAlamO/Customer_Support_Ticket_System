import React from 'react';

const TicketCard = ({ticket, handleAddToProgress}) => {
    return (
        <div className='border p-4 rounded shadow cursor-pointer 
            hover:shadow-lg'
            onClick={()=>handleAddToProgress(ticket)}
        >
            <div className='flex justify-between items-center'>
                <h1 className='text-xl font-bold'>{ticket.title}</h1>
                <button className={ticket.isOpen == true?
                    "bg-green-300 text-black px-4 rounded-xl":
                    "bg-yellow-200 text-black px-4 rounded-xl"
                }>
                    {ticket.isOpen === true ? "Open":"In Porgess"}</button>
            </div>
            <p className='pt-4'>{ticket.description}</p>
            <div className='flex justify-between pt-4'>
                <div className='flex gap-4'>
                    <p>{ticket.productId}</p>
                    <h1 className={ticket.priority === "High" ? "text-red-500" :
                            ticket.priority === "Medium" ? "text-yellow-500" :
                            "text-green-500"
                    }>
                        {ticket.priority}</h1>
                </div>
                <div className='flex gap-4'>
                    <h1>{ticket.name}</h1>
                    <p>{ticket.date}</p>
                </div>
            </div>
        </div>
    );
};

export default TicketCard;