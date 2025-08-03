import React from 'react';
import Header2 from '../pages/header2';//dooctor navbar

import { Outlet } from 'react-router-dom';

const DoctorLayout = () => (
  <>
    <Header2 />
    <Outlet />
  </>
);

export default DoctorLayout;
