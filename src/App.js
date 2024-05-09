import React from 'react';
import {BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Hero from './Hero.js';
import Dashboard from './Dashboard.js'
import Support from './Support.js'
import Notifications from './Notifications.js'
import BlackList from './BlackList.js'
import Profile from './Profile.js'
import LoginPage from './LoginPage.js'
import ProtectedRoutes from './ProtectedRoutes.js';
import { UserProvider } from './UserContext';
import './styles/main.scss';

function App(){
    return (
        <Router>
            <div className='App'>
                <Routes>
                    <Route exact path='/' element={<LoginPage />} />
                    <Route exact path='/login' element={<LoginPage />} />
                    <Route element={<UserProvider><ProtectedRoutes /></UserProvider>}>
                        <Route exact path='/dashboard' element={<Dashboard />} />
                        <Route exact path='/notifications' element={<Notifications />} />
                        <Route exact path='/support' element={<Support />} />
                        <Route exact path='/profile' element={<Profile />} />
                        <Route exact path='/blacklist' element={<BlackList />} />
                    </Route>
                </Routes>
            </div>
        </Router>
    );
}

export default App;