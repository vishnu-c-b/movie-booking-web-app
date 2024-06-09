import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePageComponent from './components/HomePageComponent';
import NavbarComponent from './components/NavbarComponent';
import LoginComponent from './components/auth/Login';
import RegisterComponent from './components/auth/Register';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import './styles.css'; // Import the custom CSS file
import AdminHomePageComponent from './components/ADMIN ONLY/adminDash';
import UserBookings from './components/userbk';


const App = () => {
    return (
        <Router>
            <div>
                <NavbarComponent />
                <Routes>
                    
                    <Route path="/home" element={<HomePageComponent />} />
                    <Route path="/" element={<LoginComponent />} />
                    <Route path="/register" element={<RegisterComponent/>} />
                    <Route path="/userbooking" element={<UserBookings />} />
                   
                    <Route path="/adminDash" element={<AdminHomePageComponent />} /> 
                </Routes>
                <footer className="footer">
                    <div >
                        <span>&copy; 2024 BookMyShow. All Rights Reserved.</span>
                    </div>
                </footer>
            </div>
        </Router>
    );
};

export default App;
