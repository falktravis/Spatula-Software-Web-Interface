import React, { useState, useEffect, useContext, useRef } from 'react'
import { UserContext } from './UserContext';
import { NavLink } from 'react-router-dom'

//styles
import './styles/navBar.scss'

//icons
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditNotificationsOutlinedIcon from '@mui/icons-material/EditNotificationsOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LogoutIcon from '@mui/icons-material/Logout';

export default function NavBar() {
    const [isNavOpen, setIsNavOpen] = useState(false);
    let navButtonRef = useRef(null);
    let navRef = useRef(null);
    let userData = useContext(UserContext);

    useEffect(() => {
        const handleClickOutside = (event) => {
          if (navRef.current && !navRef?.current?.contains(event.target) && navButtonRef.current && !navButtonRef?.current?.contains(event.target)) {
            setIsNavOpen(false);
          }
        };
    
        if (isNavOpen) {
          // Add event listener when the menu is open
          document.addEventListener('click', handleClickOutside);
        } else {
          // Remove event listener when the menu is closed
          document.removeEventListener('click', handleClickOutside);
        }
    
        // Cleanup: remove event listener when component unmounts
        return () => {
          document.removeEventListener('click', handleClickOutside);
        };
      }, [isNavOpen]);

    const handleLogout = () => {

    }

    return (
        <nav className='NavBarContainer'>
            <h1><NavLink exact="true" to="/">{userData?.Company}</NavLink></h1>
            <div className='Menu'>
                <NavLink to="/dashboard">Dashboard</NavLink>
                <button ref={navButtonRef} onClick={() => setIsNavOpen(!isNavOpen)}>
                    <ExpandMoreIcon className="ArrowDropDownIcon" />
                    <img src={userData?.ProfileImg} alt="Profile Picture" />
                </button>
                <div ref={navRef} className={`profileMenu ${isNavOpen}`}>
                    <div className="profileDisplay">
                        <img src={userData?.ProfileImg} alt="Profile Picture" />
                        <p>{userData?.Company}</p>
                    </div>
                    <ul>
                        <li>
                            <NavLink to="/profile">
                                <PersonOutlineIcon className='icon' />
                                <p>Profile</p>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/notifications">
                                <EditNotificationsOutlinedIcon className='icon' />
                                <p>Notifications</p>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/blacklist">
                                <BlockOutlinedIcon className='icon' />
                                <p>Blacklist</p>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/support">
                                <SupportAgentOutlinedIcon className='icon' />
                                <p>Support</p>
                            </NavLink>
                        </li>
                        <li>
                            <a onClick={handleLogout} className='logout'>
                                <LogoutIcon className='icon' />
                                <p>Sign Out</p>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    )
}
