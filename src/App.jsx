import { useEffect, useState } from 'react'
import './App.css'
import Banner from './Component/Banner/Banner'
import Navbar from './Component/Navbar/Navbar'
import TaskCard from './Component/TaskCard/TaskCard'
import TicketList from './Component/TicketList/TicketList'
import { ToastContainer, toast } from 'react-toastify';
import ResolveTask from './Component/ResolveTask/ResolveTask'
import Footer from './Component/Footer/Footer'

function App() {
const [tickets, setTickets] = useState([]);

useEffect(() => {
  fetch("/tickets.json")
    .then((res) => res.json())
    .then((data) => {
      // console.log(data)
      const saved = JSON.parse(localStorage.getItem("tickets"));
      if (saved) setTickets(saved);
      else setTickets(data); // data is already an array
    })
    .catch(err => console.log("Fetch error:", err));
}, []);


  const handleAddToProgress = (ticket) => {

    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticket.id ? { ...t, status: "in-progress" } : t
      )
    );

    toast("Added to In Progress!");
  };

  const handleComplete = (id) => {
  setTickets((prev) =>
    prev.map((t) =>
      t.id === id ? { ...t, status: "resolved" } : t
    )
  );

  toast("Task Completed!");
};
 

  const inProgress = tickets.filter((t) => t.status === "in-progress");
  const resolved = tickets.filter((t) => t.status === "resolved");
  return (
    <>
      <Navbar></Navbar>
      <Banner inProgress={inProgress} resolved={resolved}></Banner>
      <div className='flex flex-col lg:flex-row p-4 
        gap-4 max-w-[1200px] mx-auto w-full'>
        <div className='flex-1'>
          <TicketList tickets={tickets} 
            handleAddToProgress={handleAddToProgress}>

            </TicketList>
        </div>
        <div>
          <TaskCard handleComplete={handleComplete}
            inProgress={inProgress}
          ></TaskCard>
          <ResolveTask resolved={resolved}></ResolveTask>
        </div>
      </div>
      <Footer></Footer>
      <ToastContainer></ToastContainer>
    </>
  )
}

export default App
