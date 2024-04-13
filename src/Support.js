import React from 'react';
import './styles/dashboard.scss';
import './styles/navBar.scss';

export default function Support() {
  return (
    <div>
      <nav className='NavBar'>
          <h1><a href='/'>Spatula Software</a></h1>
          <ul>
              <li><a href='/dashboard'>Dashboard</a></li>
              <li><a href="/settings">Settings</a></li>
              <li><a>Support</a></li>
          </ul>
      </nav>
      <main>
          Support
      </main>
  </div>
  )
}
