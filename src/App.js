import logo from './logo.svg';
import './App.css';
import {useEffect, useState } from "react";
import axios from 'axios';
import Component from './Component';
import { Router, Route } from 'react-router-dom';

function App() {


  return (
    <div class="main">
      <Component/>
    </div>
  );
}

export default App;