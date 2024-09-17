import React from 'react';
import MyNavbar from '../components/navbar';
import { LoginForm } from '../components/loginform';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {


  return (
    <>
      <MyNavbar/> 
      <LoginForm/>
    </>
  );
}

export default LoginPage;
