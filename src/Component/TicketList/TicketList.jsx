import React from 'react';
import TicketCard from '../TicketCard/TicketCard';

const TicketList = ({tickets, handleAddToProgress}) => {
    // console.log(tickets)
    const activeTickets = tickets.filter(
        (t) => t.status !== "resolved"
    );
    return (
        <div>
            <h1 className='text-2xl font-bold mb-4'>Customer Tickets</h1>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {
                activeTickets.map(ticket=>
                    <TicketCard 
                    key={ticket.id}
                    ticket={ticket} 
                    handleAddToProgress={handleAddToProgress}></TicketCard>
                )
             }
           </div>
        </div>
    );
};

export default TicketList;