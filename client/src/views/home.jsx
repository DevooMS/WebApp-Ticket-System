import MyNavbar from '../components/navbar';
import TicketsPage from '../components/ticketpage';
import React, { useState,useContext } from 'react';
import { Container } from 'react-bootstrap';
import { useAuth ,useData } from '../App'; // Adjust the import path accordingly


const Home_Page = (props) => {
  
  // Variabile di stato per gestire l'autenticazione
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const { loggedIn, username, role } = useAuth();
  const {startData } = useData();


  // Funzione per il logout
  const handleLogout = () => {
    // Imposta isAuthenticated a false al momento del logout
    setIsAuthenticated(false);
  };

  return (
    <>
      <MyNavbar isAuthenticated={isAuthenticated} handleLogout={handleLogout} />
      <Container fluid>
        {/* Contenuto della pagina, incluso il componente TicketsPage */}
        <TicketsPage isAuthenticated={loggedIn} user={username} role={role} intialData={startData} />
        {/* Footer */}
        <footer className="text-center mt-4">
          <p>&copy; YUNA Company {new Date().getFullYear()}</p>
        </footer>
      </Container>
    </>
  );
};

export default Home_Page;
