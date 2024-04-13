import React from 'react';
import './styles/dashboard.scss';
import './styles/navBar.scss';

export default function Settings() {
  return (
    <div>
        <nav className='NavBar'>
            <h1><a href='/'>Spatula Software</a></h1>
            <ul>
                <li><a href='/dashboard'>Dashboard</a></li>
                <li><a>Settings</a></li>
                <li><a href="/support">Support</a></li>
            </ul>
        </nav>
        <main>
            <p>Notifications</p>
            <input type="radio" name="notifications" id="notifications" />
            <div className="blockContainer">
              <p>Blocked Users</p>
              <div className="block">
                <a href="">Username</a>
                <button>Trash can</button>
              </div>
            </div>
        </main>
    </div>
  )
}
