import { useEffect, useRef, useState } from 'react';
import './App.css';
import Banner from './Component/Banner/Banner';
import Navbar from './Component/Navbar/Navbar';
import TaskCard from './Component/TaskCard/TaskCard';
import TicketList from './Component/TicketList/TicketList';
import { ToastContainer, toast } from 'react-toastify';
import ResolveTask from './Component/ResolveTask/ResolveTask';
import Footer from './Component/Footer/Footer';
import CreateTicketForm from './Component/CreateTicketForm/CreateTicketForm';
import TicketDetails from './Component/TicketDetails/TicketDetails';
import AuthPanel from './Component/AuthPanel/AuthPanel';
import 'react-toastify/dist/ReactToastify.css';

const authStorageKey = 'ticket-system-auth-token';

const initialTicketForm = {
  title: '',
  description: '',
  priority: 'Medium',
};

const initialAuthForm = {
  name: '',
  email: '',
  password: '',
  role: 'Customer',
};

const priorityOptions = new Set(['High', 'Medium', 'Low']);

async function parseJson(response, fallbackMessage) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || fallbackMessage);
  }

  return data;
}

function App() {
  const [tickets, setTickets] = useState([]);
  const [comments, setComments] = useState([]);
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [ticketForm, setTicketForm] = useState(initialTicketForm);
  const [authForm, setAuthForm] = useState(initialAuthForm);
  const [authMode, setAuthMode] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState(() => localStorage.getItem(authStorageKey) || '');
  const [checkingAuth, setCheckingAuth] = useState(() => Boolean(localStorage.getItem(authStorageKey)));
  const [commentMessage, setCommentMessage] = useState('');
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittingAuth, setSubmittingAuth] = useState(false);
  const formRef = useRef(null);
  const authRef = useRef(null);

  function getAuthHeaders() {
    return authToken
      ? {
          Authorization: `Bearer ${authToken}`,
        }
      : {};
  }

  async function loadTickets(activePriority) {
    const params = new URLSearchParams();
    if (activePriority !== 'All') {
      params.set('priority', activePriority);
    }

    const query = params.toString();
    const url = query ? `/api/tickets?${query}` : '/api/tickets';
    return parseJson(await fetch(url), 'Unable to load tickets.');
  }

  useEffect(() => {
    if (!authToken) {
      setCurrentUser(null);
      setCheckingAuth(false);
      return;
    }

    const run = async () => {
      try {
        const data = await parseJson(
          await fetch('/api/auth/me', {
            headers: {
              ...getAuthHeaders(),
            },
          }),
          'Unable to load your account.',
        );
        setCurrentUser(data);
      } catch {
        localStorage.removeItem(authStorageKey);
        setAuthToken('');
        setCurrentUser(null);
      } finally {
        setCheckingAuth(false);
      }
    };

    run();
  }, [authToken]);

  useEffect(() => {
    const run = async () => {
      setLoadingTickets(true);

      try {
        const data = await loadTickets(priorityFilter);
        setTickets(data);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoadingTickets(false);
      }
    };

    run();
  }, [priorityFilter]);

  useEffect(() => {
    if (!tickets.length) {
      setSelectedTicketId(null);
      return;
    }

    setSelectedTicketId((currentId) => {
      const ticketStillExists = tickets.some((ticket) => ticket.id === currentId);
      return ticketStillExists ? currentId : tickets[0].id;
    });
  }, [tickets]);

  useEffect(() => {
    if (!selectedTicketId) {
      setComments([]);
      return;
    }

    const run = async () => {
      setLoadingComments(true);

      try {
        const data = await parseJson(
          await fetch(`/api/tickets/${selectedTicketId}/comments`),
          'Unable to load comments.',
        );
        setComments(data);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoadingComments(false);
      }
    };

    run();
  }, [selectedTicketId]);

  const selectedTicket = tickets.find((ticket) => ticket.id === selectedTicketId) || null;
  const openTickets = tickets.filter((ticket) => ticket.isOpen);
  const closedTickets = tickets.filter((ticket) => !ticket.isOpen);

  async function refreshTickets() {
    setLoadingTickets(true);

    try {
      const data = await loadTickets(priorityFilter);
      setTickets(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingTickets(false);
    }
  }

  function handleSelectTicket(ticketId) {
    setSelectedTicketId(ticketId);
  }

  function handleTicketFormChange(event) {
    const { name, value } = event.target;
    setTicketForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleAuthFormChange(event) {
    const { name, value } = event.target;
    setAuthForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setSubmittingAuth(true);

    try {
      const endpoint = authMode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const payload =
        authMode === 'register'
          ? authForm
          : {
              email: authForm.email,
              password: authForm.password,
            };

      const data = await parseJson(
        await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }),
        authMode === 'register' ? 'Failed to register.' : 'Failed to log in.',
      );

      localStorage.setItem(authStorageKey, data.token);
      setAuthToken(data.token);
      setCurrentUser(data.user);
      setPriorityFilter('All');
      setSelectedTicketId(null);
      setAuthForm(initialAuthForm);
      setTicketForm(initialTicketForm);
      toast.success(authMode === 'register' ? 'Account created successfully.' : 'Logged in successfully.');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmittingAuth(false);
    }
  }

  async function handleLogout() {
    try {
      if (authToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            ...getAuthHeaders(),
          },
        });
      }
    } finally {
      localStorage.removeItem(authStorageKey);
      setAuthToken('');
      setCurrentUser(null);
      setPriorityFilter('All');
      setSelectedTicketId(null);
      toast.success('Logged out successfully.');
    }
  }

  async function handleCreateTicket(event) {
    event.preventDefault();

    if (!currentUser) {
      toast.error('Please log in to create a ticket.');
      authRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    if (!priorityOptions.has(ticketForm.priority)) {
      toast.error('Choose a valid priority.');
      return;
    }

    setSubmittingTicket(true);

    try {
      const data = await parseJson(
        await fetch('/api/tickets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify(ticketForm),
        }),
        'Failed to create ticket.',
      );

      setTickets((current) =>
        priorityFilter === 'All' || priorityFilter === data.priority ? [data, ...current] : current,
      );
      setSelectedTicketId((currentId) =>
        priorityFilter === 'All' || priorityFilter === data.priority ? data.id : currentId,
      );
      setTicketForm((current) => ({
        ...initialTicketForm,
        priority: current.priority,
      }));
      toast.success('Ticket created successfully.');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmittingTicket(false);
    }
  }

  async function handleUpdateTicketStatus(ticketId, isOpen) {
    if (!currentUser) {
      toast.error('Please log in to update ticket status.');
      authRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    try {
      const data = await parseJson(
        await fetch(`/api/tickets/${ticketId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify({ isOpen }),
        }),
        'Failed to update ticket status.',
      );

      setTickets((current) =>
        current.map((ticket) => (ticket.id === ticketId ? data : ticket)),
      );
      toast.success(isOpen ? 'Ticket reopened.' : 'Ticket closed.');
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function handleAddComment(event) {
    event.preventDefault();

    if (!currentUser) {
      toast.error('Please log in to add a comment.');
      authRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    if (!selectedTicket) {
      toast.error('Select a ticket first.');
      return;
    }

    setSubmittingComment(true);

    try {
      const data = await parseJson(
        await fetch(`/api/tickets/${selectedTicket.id}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify({ message: commentMessage.trim() }),
        }),
        'Failed to add comment.',
      );

      setComments((current) => [data, ...current]);
      setTickets((current) =>
        current.map((ticket) =>
          ticket.id === selectedTicket.id
            ? { ...ticket, commentsCount: Number(ticket.commentsCount || 0) + 1 }
            : ticket,
        ),
      );
      setCommentMessage('');
      toast.success('Comment added.');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmittingComment(false);
    }
  }

  function scrollToCreateForm() {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function scrollToAuthForm() {
    authRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (checkingAuth) {
    return (
      <>
        <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">Checking Your Session</h1>
            <p className="mt-3 text-slate-500">Please wait while we sign you in.</p>
          </div>
        </main>
        <ToastContainer position="bottom-right" />
      </>
    );
  }

  if (!currentUser) {
    return (
      <>
        <main className="min-h-screen bg-slate-100 px-4 py-10">
          <div className="mx-auto grid max-w-[1100px] gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-[32px] bg-gradient-to-br from-sky-900 via-sky-700
              to-emerald-500 p-8 text-white shadow-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-100">
                Customer Support Ticket System
              </p>
              <h1 className="mt-4 text-4xl font-bold leading-tight">
                Log in to access your support dashboard.
              </h1>
              <p className="mt-4 max-w-xl text-base text-white">
                Create tickets, add comments, update ticket status, and manage support requests
                from one secure workspace.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/16 p-4 backdrop-blur-sm">
                  <p className="text-3xl font-bold">24/7</p>
                  <p className="mt-2 text-sm text-white">Track tickets anytime</p>
                </div>
                <div className="rounded-2xl bg-white/16 p-4 backdrop-blur-sm">
                  <p className="text-3xl font-bold">3</p>
                  <p className="mt-2 text-sm text-white">Priority levels supported</p>
                </div>
                <div className="rounded-2xl bg-white/16 p-4 backdrop-blur-sm">
                  <p className="text-3xl font-bold">1</p>
                  <p className="mt-2 text-sm text-white">Shared support workspace</p>
                </div>
              </div>
            </section>

            <section
              ref={authRef}
              className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-lg sm:p-8"
            >
              <AuthPanel
                mode={authMode}
                formData={authForm}
                onChange={handleAuthFormChange}
                onSubmit={handleAuthSubmit}
                onModeChange={setAuthMode}
                submitting={submittingAuth}
              />
            </section>
          </div>
        </main>
        <ToastContainer position="bottom-right" />
      </>
    );
  }

  return (
    <>
      <Navbar
        onCreateClick={scrollToCreateForm}
        currentUser={currentUser}
        onAuthClick={scrollToAuthForm}
        onLogout={handleLogout}
      />
      <Banner inProgress={openTickets} resolved={closedTickets} />

      <main className="mx-auto max-w-[1200px] space-y-8 px-4 pb-10">
        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Customer Support Tickets</h1>
              <p className="text-sm text-slate-500">
                Track support requests, update statuses, and manage comments from one place.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                Priority
                <select
                  value={priorityFilter}
                  onChange={(event) => setPriorityFilter(event.target.value)}
                  className="select select-bordered select-sm w-36"
                >
                  <option value="All">All</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </label>

              <button type="button" className="btn btn-outline btn-sm" onClick={refreshTickets}>
                Refresh
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.45fr_0.85fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <TicketList
              tickets={tickets}
              loading={loadingTickets}
              selectedTicketId={selectedTicketId}
              handleAddToProgress={handleSelectTicket}
            />
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <TaskCard
                handleComplete={(ticketId) => handleUpdateTicketStatus(ticketId, false)}
                inProgress={openTickets}
                activeTicketId={selectedTicketId}
                onSelectTicket={handleSelectTicket}
              />
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <ResolveTask
                resolved={closedTickets}
                activeTicketId={selectedTicketId}
                onSelectTicket={handleSelectTicket}
                onReopenTicket={(ticketId) => handleUpdateTicketStatus(ticketId, true)}
              />
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div ref={formRef} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <CreateTicketForm
              currentUser={currentUser}
              formData={ticketForm}
              onChange={handleTicketFormChange}
              onSubmit={handleCreateTicket}
              submitting={submittingTicket}
            />
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <TicketDetails
              ticket={selectedTicket}
              currentUser={currentUser}
              comments={comments}
              loadingComments={loadingComments}
              commentMessage={commentMessage}
              onCommentChange={setCommentMessage}
              onSubmitComment={handleAddComment}
              submittingComment={submittingComment}
              onToggleStatus={(ticket) => handleUpdateTicketStatus(ticket.id, !ticket.isOpen)}
            />
          </div>
        </section>
      </main>

      <Footer />
      <ToastContainer position="bottom-right" />
    </>
  );
}

export default App;
