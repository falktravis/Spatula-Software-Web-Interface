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

    useEffect(() => {
        if(scrollReady == false){
            console.log(scrollReady);
            setTimeout(() => setScrollReady(true), 1000)
        }
    }, [scrollReady])

    return (
        <div className={"heroPage page" + page} onWheel={e => handleScroll(e)}>
            <nav className="NavBar">
                <h1><a href='/'>Inventory Auto Solutions</a></h1>
                <a onClick={handleLogin}>Login</a>
            </nav>
            <main>
                <div className="heroContent">
                    <h2>Power Up Your Inventory With <br/><span><ReactTyped id="focus" strings={['Artificial Intelligence', 'High-Quality Leads', 'Web Scraping', 'Inventory Auto Solutions']} typeSpeed={45} backSpeed={45} backDelay={2000} loop></ReactTyped></span></h2>
                </div>
                <a href="">Get a Quote</a>
            </main>
            <div className='blur' id="blur1"></div>
            <div className='blur' id="blur2"></div>
            <div className='blur' id="blur3"></div>
        </div>
    )
}
