import React, { useLayoutEffect, useRef } from 'react';
import { useAuth } from './Controller.jsx';
import rough from 'roughjs'

function Canvas() {
    const canvasRef = useRef(null);
    const {handleMouseDown , handleMouseMove, handleMouseUp,currentElement,elements,mode,inputPoints,darkMode} = useAuth();

    useLayoutEffect(() =>{
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rc = rough.canvas(canvas);
        // const generator = rough.generator()
        ctx.clearRect(0,0,canvas.width,canvas.height)
        ctx.save()
        console.log(elements)

        elements?.forEach(({roughElement,x1,y1,x2,y2,type}) =>{
            console.log(roughElement)
            if(type === 'rectangle' || type === 'circle' || type === 'line'){
                console.log(type)
                rc.draw(roughElement)
            }
            else if(type === 'triangle'){
                let {fill,stroke} = roughElement;
                ctx.strokeStyle = stroke;
                ctx.fillStyle = fill;
                ctx.lineWidth = '2'
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.lineTo(x1 - (x2 - x1), y2);
                ctx.lineTo(x1,y1);
                ctx.fill();
                ctx.stroke();
                ctx.closePath();
            }
            else if(type === 'arrow'){
                const startX = x1;
                const startY = y1;
                const endX = x2;
                const endY = y2;
            
                // Draw a line
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.stroke();
            
                // Draw arrowhead
                const angle = Math.atan2(endY - startY, endX - startX);
                const arrowHeadLength = 10;
            
                // Calculate the coordinates of the arrowhead lines
                const arrowX1 = endX - arrowHeadLength * Math.cos(angle - Math.PI / 6);
                const arrowY1 = endY - arrowHeadLength * Math.sin(angle - Math.PI / 6);
                const arrowX2 = endX - arrowHeadLength * Math.cos(angle + Math.PI / 6);
                const arrowY2 = endY - arrowHeadLength * Math.sin(angle + Math.PI / 6);
            
                // Draw arrowhead lines
                ctx.beginPath();
                ctx.moveTo(endX, endY);
                ctx.lineTo(arrowX1, arrowY1);
                ctx.moveTo(endX, endY);
                ctx.lineTo(arrowX2, arrowY2);
                ctx.stroke();
            }
            else if(type === 'pen'){
                ctx.fillStyle = 'blue';
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 15;
                const myPath = new Path2D(roughElement.path);
                ctx.fill(myPath)
                ctx.stroke();

                // ctx.beginPath();
                // ctx.moveTo(inputPoints[0][0], inputPoints[0][1]);
                // for (let i = 1; i < inputPoints.length; i++) {
                //     const [ x, y ] = inputPoints[i];
                //     ctx.lineTo(x, y);
                // }
                // ctx.stroke();
                // ctx.closePath()
            }
        })
    },[elements])

    return (
        <div >
            <div className = "bg-white dark:bg-zinc-800">
                <canvas
                id = "canvas"
                width = {window.innerWidth}
                height = {window.innerHeight}
                onMouseDown={ handleMouseDown }
                onMouseMove={ handleMouseMove }
                onMouseUp={ handleMouseUp }
                ref = {canvasRef}
                />
            </div>
        </div>
    )
}

export default Canvas
