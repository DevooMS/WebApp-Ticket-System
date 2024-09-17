import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap'; // Import Bootstrap components for modal, button, and form

// The ManageTicketModal component manages the modal for updating ticket details
function ManageTicketModal({ show, onHide, ticket, role, handleUpdateTicket, handleManage }) {
  // State variables for managing new ticket category and status
  const [newCategory, setNewCategory] = useState(ticket.category); // Initialize with current ticket category
  const [newStatus, setNewStatus] = useState(ticket.status); // Initialize with current ticket status

  // Function to handle the form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Construct the updated ticket object
    const updatedTicket = {
      ...ticket, // Copy existing ticket properties
      status: role === 0 ? 'closed' : newStatus, // Role 0 (regular user) can only close the ticket
      category: role === 1 ? newCategory : ticket.category, // Role 1 (admin) can update the category
    };
    
    try {
      await handleManage(updatedTicket); // Call the handleManage function to manage the updated ticket
      handleUpdateTicket(updatedTicket); // Update the parent component with the updated ticket
      onHide(); // Close the modal
    } catch (error) {
      console.error('Error updating ticket:', error); // Log any errors
    }
  };


  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <div> <Modal.Title>Manage Ticket:</Modal.Title>
        <h5>Ticket Name: {ticket.title}</h5>
        </div>
       
      </Modal.Header>
      <Modal.Body>
      
        {role === 0 && <p>Are you sure you want to close this ticket?</p>}
        {role === 1 && (
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formCategory">
              <Form.Label>Change Category</Form.Label>
              <Form.Control
                as="select"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              >
                <option value="">Select category</option>
                <option value="inquiry">Inquiry</option>
                <option value="maintenance">Maintenance</option>
                <option value="new feature">New Feature</option>
                <option value="administrative">Administrative</option>
                <option value="payment">Payment</option>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formStatus">
              <Form.Label>Change Status</Form.Label>
              <Form.Control
                as="select"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </Form.Control>
            </Form.Group>
            <Button variant="primary mt-3" type="submit">
              Save Changes
            </Button>
          </Form>
        )}
        {role === 0 && (
          <Button variant="danger mt-3" onClick={handleSubmit}>
            Close Ticket
          </Button>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default ManageTicketModal;
