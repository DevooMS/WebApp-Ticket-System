import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap'; // Import Bootstrap components for modal, buttons, and forms
import { useData } from '../App'; // Import custom hook for data handling

// NewTicketModal component manages the modal for creating a new ticket
const NewTicketModal = ({ show, onHide, owner, role }) => {
  // State variables to manage form inputs and modal states
  const [category, setCategory] = useState(''); // For ticket category
  const { estimationsCRTData, handleSubmit, handlecrtEstimation } = useData(); // Custom hook for data-related functions and state
  const [title, setTitle] = useState(''); // For ticket title
  const [description, setDescription] = useState(''); // For ticket description
  const [confirmationShown, setConfirmationShown] = useState(false); // For showing confirmation modal
  const [successModalShown, setSuccessModalShown] = useState(false); // For showing success modal
  const [errors, setErrors] = useState({ category: '', title: '', description: '' }); // For form validation errors

  // Function to validate the form inputs
  const validateForm = () => {
    const newErrors = { category: '', title: '', description: '' };
    if (!category) newErrors.category = 'Category is required'; // Check if category is filled
    if (!title) newErrors.title = 'Title is required'; // Check if title is filled
    if (!description) newErrors.description = 'Description is required'; // Check if description is filled
    setErrors(newErrors); // Update the errors state
    return !newErrors.category && !newErrors.title && !newErrors.description; // Return true if no errors
  };

  // Function to handle ticket creation process
  const handleCreateTicket = async () => {
    if (validateForm()) { // Proceed if the form is valid
      const charCount = title.replace(/\s/g, '').length + category.replace(/\s/g, '').length; // Calculate character count without spaces
      const calculatedLengths = { role, ticket_id: null, charCount }; // Prepare data for estimation
      setConfirmationShown(true); // Show confirmation modal
      await handlecrtEstimation(calculatedLengths); // Call the estimation function
    }
  };

  // Function to close the confirmation modal and hide the parent modal
  const handleConfirmationClose = () => {
    setConfirmationShown(false); // Hide confirmation modal
    onHide(); // Call onHide to hide the parent modal
  };

  // Function to handle final confirmation and submission of the ticket
  const handleConfirmSubmit = async () => {
    const createTicketINFO = { category, owner, title, description }; // Prepare ticket data
    try {
      await handleSubmit(createTicketINFO); // Submit the ticket
      handleConfirmationClose(); // Close the confirmation modal
      setSuccessModalShown(true); // Show success modal
    } catch (error) {
      console.error('Error submitting ticket to server:', error); // Log any errors
    }
  };

  // Use effect to automatically close the success modal after a delay
  useEffect(() => {
    if (successModalShown) { // When the success modal is shown
      const timer = setTimeout(() => {
        setSuccessModalShown(false); // Hide success modal
        onHide(); // Hide the parent modal
      }, 3000); // Wait for 3 seconds
      return () => clearTimeout(timer); // Clear the timer on cleanup
    }
  }, [successModalShown, onHide]); // Dependencies for the effect

  return (
    <>
      <Modal show={show && !confirmationShown && !successModalShown} onHide={onHide}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Ticket</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="category">
              <Form.Label>Category</Form.Label>
              <Form.Control
                as="select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                isInvalid={!!errors.category}
              >
                <option value="">Select category</option>
                <option value="inquiry">Inquiry</option>
                <option value="maintenance">Maintenance</option>
                <option value="new feature">New Feature</option>
                <option value="administrative">Administrative</option>
                <option value="payment">Payment</option>
              </Form.Control>
              <Form.Control.Feedback type="invalid">
                {errors.category}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="owner">
              <Form.Label>Owner</Form.Label>
              <Form.Control type="text" value={owner} readOnly />
            </Form.Group>
            <Form.Group controlId="title">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                isInvalid={!!errors.title}
              />
              <Form.Control.Feedback type="invalid">
                {errors.title}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="description">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                isInvalid={!!errors.description}
              />
              <Form.Control.Feedback type="invalid">
                {errors.description}
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Close
          </Button>
          <Button variant="primary" onClick={handleCreateTicket} >
            Create Ticket
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={confirmationShown} onHide={handleConfirmationClose}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Ticket Submission</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Category: {category}</p>
          <p>Owner: {owner}</p>
          <p>Title: {title}</p>
          <p>Description: {description}</p>
          <p>Estimation Time: {estimationsCRTData.estimations?.[0]?.estimation ?? 'N/A'}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleConfirmationClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleConfirmSubmit}>
            Confirm and Submit
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={successModalShown} onHide={() => setSuccessModalShown(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Success</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Your ticket has been created successfully!</p>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default NewTicketModal;
