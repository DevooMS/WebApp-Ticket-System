import React from 'react';

const UserProfile = ({ username, numTickets }) => {
  return (
    <div className="user-profile">
      <h2>{username}</h2>
      <p>Numero di ticket pubblicati: {numTickets}</p>
    </div>
  );
};

export default UserProfile;
