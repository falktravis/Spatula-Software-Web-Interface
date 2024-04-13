import React from 'react';
import {BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Hero from './Hero.js';
import Dashboard from './Dashboard.js'
import Support from './Support.js'
import Settings from './Settings.js'
import LoginPage from './LoginPage.js'
import ProtectedRoutes from './ProtectedRoutes.js';
import './styles/main.scss';

function App(){
    return (
        <Router>
            <div className='App'>
                <Routes>
                    <Route exact path='/' element={<Hero />} />
                    <Route exact path='/login' element={<LoginPage />} />
                    <Route element={<ProtectedRoutes />}>
                        <Route exact path='/dashboard' element={<Dashboard />} />
                        <Route exact path='/settings' element={<Settings />} />
                        <Route exact path='/support' element={<Support />} />
                    </Route>
                </Routes>
            </div>
        </Router>
    );
}

export default App;