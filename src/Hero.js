import React, {useState, useRef, useEffect} from 'react';
import {ReactTyped} from 'react-typed';
import { useNavigate } from "react-router-dom"
import { app } from './realm';
import './styles/hero.scss';

export default function Hero() {
    const [scrollReady, setScrollReady] = useState(false)
    const [page, setPage] = useState(1)
    const navigate = useNavigate();

    const handleScroll = (e) => {
        if(scrollReady == true){
            if(e.deltaY > 0){
                if(page < 3){
                    setScrollReady(false);
                    setPage(page + 1)
                }
            }else{
                if(page > 1){
                    setScrollReady(false);
                    setPage(page - 1)
                }
            }
        }
    }

    const handleLogin = () => {
        if(app?.currentUser){
            navigate('/dashboard');
        }else{
            navigate('/login')
        }
    }

    const handleQuoteButton = () => {

    }

    useEffect(() => {
        if(scrollReady == false){
            console.log(scrollReady);
            setTimeout(() => setScrollReady(true), 1000)
        }
    }, [scrollReady])

    return (
        <div className={"heroPage page" + page} onWheel={e => handleScroll(e)}>
            <nav className="NavBar">
                <h1><a>Inventory Auto Solutions</a></h1>
                <a onClick={handleLogin}>Login</a>
            </nav>
            <main>
                <div className="heroContainer">
                    <div className="heroContent">
                        <h2>Power Up Your Inventory With <br/><span><ReactTyped id="focus" strings={['Artificial Intelligence', 'High-Quality Leads', 'Web Scraping', 'Inventory Auto Solutions']} typeSpeed={45} backSpeed={45} backDelay={2000} loop></ReactTyped></span></h2>
                    </div>
                    <a onClick={handleQuoteButton}>Get a Quote</a>
                </div>
                <div className="infoDisplay">
                    <div className="section1">

                    </div>
                    <div className="section2">

                    </div>
                    <div className="section3">

                    </div>
                </div>
                <form>
                    <h2>Contact Us</h2>
                    <p>React out and we will get back to you as soon as possible!</p>
                    <div className="name">
                        <label htmlFor="first">First Name:</label>
                        <input type="text" name="first" id="first" />
                        <label htmlFor="last">Last Name:</label>
                        <input type="text" name="last" id="last" />
                    </div>
                    <label htmlFor="reason">Reason:</label>
                    <select name="reason" id="reason">
                        <option value="quote">Request a Quote</option>
                        <option value="questions">Ask a Question</option>
                        <option value="other">Other</option>
                    </select>
                    <div className="contactInfo">
                        <label htmlFor="email">Email:</label>
                        <input type="email" name="email" id="email" />
                        <label htmlFor="phone">Phone Number:</label>
                        <input type="tel" name="phone" id="phone" />
                    </div>
                    <label htmlFor="preferredContact">Preferred Contact:</label>
                    <select name="preferredContact" id="preferredContact">
                        <option value="email">Email</option>
                        <option value="call">Call</option>
                        <option value="text">Text</option>
                    </select>
                    <label htmlFor="description">Description:</label>
                    <textarea placeholder="Tell us who you are and why you are reaching out" name="description" id="description" cols="30" rows="10"></textarea>
                </form>
            </main>
            <div className='blur' id="blur1"></div>
            <div className='blur' id="blur2"></div>
            <div className='blur' id="blur3"></div>
        </div>
    )
}
