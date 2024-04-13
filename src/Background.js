import React, {useEffect, useState} from 'react'

const useMousePosition = () => {
    const [
      mousePosition,
      setMousePosition
    ] = React.useState({ x: null, y: null });
  
    React.useEffect(() => {
      const updateMousePosition = ev => {
        setMousePosition({ x: ev.clientX, y: ev.clientY });
      };
      
      window.addEventListener('mousemove', updateMousePosition);
  
      return () => {
        window.removeEventListener('mousemove', updateMousePosition);
      };
    }, []);
  
    return mousePosition;
  };

export default function background(){
     /**
     * Make the circles less frequent
     * Collide with each other and maybe change the enlarging function to collide with the mouse as well
     */

    let w = window.innerWidth
    let h = window.innerHeight
    let canvas
    let ctx
    let arc = 50
    let time
    let rate = 60
    let size = 10
    let speed = 3
    let parts = new Array
    let colors = ['#4E4BFF','#3EFFF3','#4E4BFF'];
    let mousePosition = useMousePosition();

    function create() {
        time = 0;

        for(let i = 0; i < arc; i++) {
            parts[i] = {
            x: Math.ceil(Math.random() * w),
            y: Math.ceil(Math.random() * h),
            toX: Math.random() * 5 - 1,
            toY: Math.random() * 2 - 1,
            c: colors[Math.floor(Math.random()*colors.length)],
            size: Math.random() * size
            }
        }
    }

    function particles() {
        ctx.clearRect(0,0,w,h);
        for(let i = 0; i < arc; i++) {
            let li = parts[i];
            let distanceFactor = DistanceBetween( mousePosition, parts[i] );
            distanceFactor = Math.max( Math.min( 15 - ( distanceFactor / 10 ), 10 ), 1 );
            ctx.beginPath();
            ctx.arc(li.x,li.y,li.size*distanceFactor,0,Math.PI*2,false);
            ctx.fillStyle = li.c;
            ctx.strokeStyle=li.c;
            if(i%2==0){
                ctx.stroke();
            }else{
                ctx.fill();
            }

            li.x = li.x + li.toX * (time * 0.05);
            li.y = li.y + li.toY * (time * 0.05);
            
            if(li.x > w){
                li.x = 0; 
            }
            if(li.y > h) {
                li.y = 0; 
            }
            if(li.x < 0) {
                li.x = w; 
            }
            if(li.y < 0) {
                li.y = h; 
            }

            
        }
        if(time < speed) {
            time++;
        }
        setTimeout(particles,1000/rate);
    }
    function DistanceBetween(p1,p2) {
        let dx = p2.x-p1.x;
        let dy = p2.y-p1.y;
        return Math.sqrt(dx*dx + dy*dy);
    }

    useEffect(() => {
        canvas = document.getElementById('background')
        ctx = canvas.getContext('2d')

        canvas.setAttribute('width',w);
        canvas.setAttribute('height',h);

        create();
        particles();    
    }, [])

    return(
        <canvas id="background">
            <p>
            Your cursor position:
            <br />
            {JSON.stringify(mousePosition)}
            </p>
        </canvas>
    )
}