// Importa il componente Navbar personalizzato
import MyNavbar from '../components/navbar';
import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';

// Definizione del componente Main_Page
const Main_Page = () => {

  return (
    <>
      {/* Include il componente Navbar */}
      <MyNavbar />
      
      {/* Container principale con margine top 3, centrato verticalmente */}
      <Container className="mt-3 d-flex justify-content-center align-items-center">
        <Row className="text-center">
          <Col>
            {/* Titolo principale */}
            <h1>Welcome to Our Company</h1>
            
            {/* Paragrafi di testo */}
            <p>We are committed to excellence in providing innovative solutions.</p>
            <p>Founded in 20XX, our company has been a leader in industry. We specialize in [Tickets System].</p>
            
            {/* Pulsante per ulteriori informazioni */}
            <Button variant="primary">Learn More</Button>
          </Col>
          
          {/* Colonna per il logo dell'azienda */}
          {/* Se necessario, aggiungi qui il logo dell'azienda */}
     
        </Row>
      </Container>
    </>
  );
};

// Esporta il componente Main_Page
export default Main_Page;
