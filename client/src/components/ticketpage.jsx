import React, { useState, useEffect } from 'react';
import { Card, Button, Nav, Form } from 'react-bootstrap';
import { RiMenuLine } from 'react-icons/ri';
import NewTicketModal from './createticket';
import ManageTicketModal from './manageticket';
import './Navigator.css';
import { format } from 'date-fns';
import { useData } from '../App';

// Main component to display tickets
function TicketsPage({ isAuthenticated, user, role, intialData }) {
  // Extract methods and data from the custom hook
  const { handleBlock, handleManage, handleSubmit, estimationsData } = useData();

  // State variables
  const [tickets, setTickets] = useState(intialData || []); // Tickets data
  const [filter, setFilter] = useState("all"); // Current filter for displaying tickets
  const [sidebarVisible, setSidebarVisible] = useState(true); // Sidebar visibility state
  const [showModal, setShowModal] = useState(false); // State to control the new ticket modal visibility
  const [expandedTickets, setExpandedTickets] = useState([]); // List of ticket IDs that are expanded
  const [newTextByTicket, setNewTextByTicket] = useState({}); // State to store new comment text by ticket ID
  const [selectedTicket, setSelectedTicket] = useState(null); // Currently selected ticket for management
  const [manageModalVisible, setManageModalVisible] = useState(false); // State to control the manage ticket modal visibility

  // Effect to update tickets with estimation times
  useEffect(() => {
    // Extract the `estimations` array from `estimationsData`
    const estimationsArray = estimationsData?.estimations || [];

    if (isAuthenticated && Array.isArray(estimationsArray)) {
      // Map each ticket with its estimation time from the `estimations` array
      const ticketsWithEstimation = (intialData || []).map(ticket => {
        const estimation = estimationsArray.find(est => est.ticket_id === ticket.ticket_id);
        return {
          ...ticket,
          estimationTime: estimation ? estimation.estimation : 'N/A'
        };
      });
      setTickets(ticketsWithEstimation);
    } else {
      // If not authenticated, use the initial data without estimation time
      const ticketsWithoutEstimation = (intialData || []).map(ticket => ({
        ...ticket,
        estimationTime: null // No estimation time for unauthenticated users
      }));
      setTickets(ticketsWithoutEstimation);
    }
  }, [intialData, estimationsData, isAuthenticated]);

  // Filter the tickets based on the selected filter
  const filteredTickets = () => { 
    let filtered;
    if (filter === "all") {
      filtered = tickets;
    } else if (filter === "user") {
      filtered = tickets.filter(ticket => ticket.owner === user);
    } else {
      filtered = tickets.filter(ticket => ticket.status === filter);
    }
    return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  // Toggle the sidebar visibility
  const toggleSidebar = () => setSidebarVisible(!sidebarVisible); 

  // Show the modal to create a new ticket
  const handleShowModal = () => setShowModal(true);   
  
  // Close the modal to create a new ticket
  const handleCloseModal = () => setShowModal(false);

  // Handle the expansion of a ticket to show its comments
  const handleExpandTicket = (ticketId) => {
    setExpandedTickets(prev =>
      prev.includes(ticketId) ? prev.filter(id => id !== ticketId) : [...prev, ticketId]
    );
  };

  // Handle the change of text in the comment input
  const handleTextChange = (ticketId, text) => {
    setNewTextByTicket(prev => ({ ...prev, [ticketId]: text }));
  };

  // Handle the addition of a block of text to a ticket
  const handleAddBlockOfText = async (ticketId) => {
    const newText = newTextByTicket[ticketId];
    const newBlock = {
      text: newText || '',
      timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      author: user
    };

    try {
      await handleBlock({ newBlock, ticketId });
      setTickets(prevTickets =>
        prevTickets.map(ticket =>
          ticket.ticket_id === ticketId
            ? { ...ticket, blocksOfText: [...ticket.blocksOfText, newBlock] }
            : ticket
        )
      );
      setNewTextByTicket(prev => ({ ...prev, [ticketId]: '' }));
    } catch (error) {
      console.error('Error submitting block to server:', error);
    }
  };

  // Handle ticket management
  const handleManageTicket = (ticket) => {
    setSelectedTicket(ticket);
    setManageModalVisible(true);
  };

  // Handle updating ticket information
  const handleUpdateTicket = (updatedTicket) => {
    setTickets(prevTickets =>
      prevTickets.map(ticket => (ticket.ticket_id === updatedTicket.ticket_id ? updatedTicket : ticket))
    );
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className={`col-md-3 bg-light fixed-left p-0 ${!sidebarVisible ? 'd-none' : ''}`}>
          <Nav variant="pills" className="flex-column mt-3">
            <Nav.Item>
              <Nav.Link active={filter === "all"} onClick={() => setFilter("all")}>
                All Tickets
              </Nav.Link>
            </Nav.Item>
            {isAuthenticated && (
              <Nav.Item>
                <Nav.Link active={filter === "user"} onClick={() => setFilter("user")}>
                My Ticket
              </Nav.Link>
              </Nav.Item>
            )}
            <Nav.Item>
              <Nav.Link active={filter === "open"} onClick={() => setFilter("open")}>
                Open Ticket
              </Nav.Link>
            </Nav.Item>

            <Nav.Item>
              <Nav.Link active={filter === "closed"} onClick={() => setFilter("closed")}>
                Closed Ticket
              </Nav.Link>
            </Nav.Item>
            {isAuthenticated && (
              <Nav.Item>
                <Nav.Link onClick={handleShowModal}>Create New Ticket</Nav.Link>
              </Nav.Item>
            )}
          </Nav>
        </div>
        <div className={`col-md-9 ${sidebarVisible ? '' : 'col-md-12'}`}>
          <Button onClick={toggleSidebar} className="toggle-sidebar-btn mt-3">
            <RiMenuLine />
          </Button>
          <div className="tickets-page p-3">
            <h1>Tickets</h1>
            <div className="ticket-list row">
              {filteredTickets().map(ticket => (
                <div className="col-md-4 mb-3" key={ticket.ticket_id}>
                  <Card style={{backgroundColor: '#F0F8FF',width: '103%'}}>
                    <Card.Body>
                      <Card.Title>{ticket.title}</Card.Title>
                      <Card.Text>Owner: {ticket.owner}</Card.Text>
                      <Card.Text>Category: {ticket.category}</Card.Text>
                      <Card.Text>Timestamp: {ticket.timestamp}</Card.Text>
                      {isAuthenticated && role === 1 && ticket.estimationTime && (
                        <Card.Text>Estimation time: {ticket.estimationTime}</Card.Text>
                      )}
                      <Card.Text>Status: {ticket.status}</Card.Text>
                      {isAuthenticated && (
                        <div className="row">
                          <div className="col">
                            <Button variant="primary" onClick={() => handleExpandTicket(ticket.ticket_id)}>
                              Expand
                            </Button>
                          </div>
                          {(role === 1 || (ticket.owner === user && ticket.status !== "closed")) && (
                            <div className="col">
                              <Button variant="danger" onClick={() => handleManageTicket(ticket)}>
                                Manage
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                      {expandedTickets.includes(ticket.ticket_id) && (
                        <div>
                          <hr className="hr" />
                          <h5>Comment</h5>
                          {ticket.blocksOfText
                            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                            .map((block, index) => (
                              <div key={index}>
                                <small>{block.timestamp} - {block.author}</small>
                                {/* Usa white-space: pre-wrap per mantenere i ritorni a capo */}
                                <p style={{ whiteSpace: 'pre-wrap' }}>{block.text}</p>   
                              </div>
                          ))}
                          {isAuthenticated && ticket.status !== "closed" && (
                            <Form
                              onSubmit={(e) => {
                                e.preventDefault();
                                handleAddBlockOfText(ticket.ticket_id);
                              }}
                            >
                              <Form.Group controlId={`newText-${ticket.ticket_id}`}>
                                <Form.Control
                                  as="textarea"
                                  rows={3}
                                  type="text"
                                  placeholder="Enter new text"
                                  value={newTextByTicket[ticket.ticket_id] || ''}
                                  onChange={(e) => handleTextChange(ticket.ticket_id, e.target.value)}
                                />
                              </Form.Group>
                              <hr className="hr" />
                              <Button variant="primary" type="submit">
                                Add Comment
                              </Button>
                            </Form>
                          )}
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <NewTicketModal show={showModal} onHide={handleCloseModal} owner={user} handleSubmit={handleSubmit} role={role}/>
      {selectedTicket && (
        <ManageTicketModal
          show={manageModalVisible}
          onHide={() => setManageModalVisible(false)}
          ticket={selectedTicket}
          role={role}
          handleUpdateTicket={handleUpdateTicket}
          handleManage={handleManage}
        />
      )}
    </div>
  );
}

export default TicketsPage;
