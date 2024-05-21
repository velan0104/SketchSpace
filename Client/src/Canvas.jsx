import React, { useLayoutEffect, useRef, useEffect, useState } from 'react';
import { useAuth } from './Controller.jsx';
import rough from 'roughjs'

function Canvas() {
    const [updatedElement,setUpdatedElement] = useState({})
    const canvasRef = useRef(null);
    const textRef = useRef(null);
    const {handleMouseDown , handleMouseMove, handleMouseUp,elements,action,selectedElement,handleBlur,currentElement} = useAuth();
    
    useEffect(() =>{
        // console.log("Action: " ,action)
        const textArea = textRef.current;
        if(action === 'writing'){
            console.log("selected Eleement: ", selectedElement)
            setTimeout(() => {
                textArea.focus();
                textArea.value = selectedElement.text;
            },0)
        }
    },[action,selectedElement])

    useLayoutEffect(() =>{
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rc = rough.canvas(canvas);
        ctx.clearRect(0,0,canvas.width,canvas.height)
        ctx.save()

        elements?.forEach((element) =>{
            console.log(element)
            const {roughElement,x1,y1,x2,y2,type} = element;
            // console.log(roughElement)
            if(type === 'rectangle' || type === 'circle' || type === 'line'){
                // console.log(type)
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
            }
            else if(type === 'text'){
                setUpdatedElement({x: x1, y: y1});
                ctx.textBaseline = "top";
                ctx.font = "24px Freestyle-Script";
                ctx.fillText(element.text, x1,y1);
                console.log(updatedElement)
            }
        })
    },[elements])


    return (
        <div >
            {action === 'writing' && (
            <textarea 
            ref = {textRef} 
            onBlur = {handleBlur}
            style = {{ top: `${updatedElement.y}px`, left: `${updatedElement.x}px`, resize: "auto", whiteSpace: "pre", background: "transparent"}}
            className = {`fixed text-[Freestyle-Script] `} />
            )}  
            <div className = "bg-white dark:bg-zinc-800">
                <canvas
                id = "canvas"
                width = {window.innerWidth}
                height = {window.innerHeight}
                onMouseDown={ handleMouseDown }
                onMouseMove={ handleMouseMove }
                onMouseUp={ handleMouseUp }
                ref = {canvasRef}
                // style = {{ position: "absolute"}}
                />
            </div>
        </div>
    )
}

export default Canvas
