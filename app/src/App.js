import React from 'react';
import FileUpload from './fileUpload';
import CreateData from './createData';
import OLEDB from './oleDB';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Nav from './nav';
import './App.css';

function App() {
  const Rutaservidor="/React_app"; 

  return (
    <>
      <BrowserRouter>
        <Nav />
        <Routes>
          <Route path={Rutaservidor} element={<FileUpload />} />
          <Route path={Rutaservidor + "/createData"} element={<CreateData />} />
          <Route path={Rutaservidor + "/OLEDB"} element={<OLEDB />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
