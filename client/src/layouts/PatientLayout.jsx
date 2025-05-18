import React from 'react';
import Header1 from '../pages/header1';//pariient navbar
import { Outlet } from 'react-router-dom';

const PatientLayout = () => (
  <>
    <Header1 />
    <Outlet />
  </>
);

export default PatientLayout;
