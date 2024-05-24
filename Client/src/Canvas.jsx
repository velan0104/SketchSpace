import React, { useLayoutEffect, useRef, useEffect, useState } from 'react';
import { useAuth } from './Controller.jsx';
import rough from 'roughjs'

function Canvas() {
    const [updatedElement,setUpdatedElement] = useState({})
    const [imagePath,setImagePath] = useState(null);
    const canvasRef = useRef(null);
    const textRef = useRef(null);
    const imageRef = useRef(null);
    const {handleMouseDown , handleMouseMove, handleMouseUp,elements,setElements,action,selectedElement,handleBlur,image,setImage,save,setSave,clear,setClear,panOffset,scale,setScaleOffset,scaleOffset} = useAuth();


    useEffect(() =>{
        if(save == true){
            saveCanvasAsImage();
        }
        setSave(false)
    },[save])
    
    useEffect(() =>{
        if(clear == true){
            clearCanvas();
        }
        setClear(false);
    },[clear])

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

    useEffect(() =>{
        if(image == true){
            imageRef.current.click();
        }
        setImage(false)
    },[image])

    useEffect(() =>{
        const handleFileChange = (e) =>{
            const file = e.target.files[0];
            if(file){
                console.log("File Selected: ", file);
                setImagePath(file);
            }
        };

        const imageElement = imageRef.current;

        if(imageElement){
            imageElement.addEventListener('change', handleFileChange);
        }

        return () =>{
            if(imageElement) {
                imageElement.removeEventListener('change', handleFileChange);
            }
        }
    },[])

    const saveCanvasAsImage = () =>{
        const canvas = canvasRef.current;
        const dataURL = canvas.toDataURL("image/png");
        const link = document.createElement('a');
        const date = Date.now()
        link.href = dataURL;
        link.download = `IMG_${date}.png`;
        link.click();
    }

    const clearCanvas = () =>{
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0,0,canvas.width,canvas.height);
        const emptyArr = [];
        setElements(emptyArr)
    }

    useLayoutEffect(() =>{  
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rc = rough.canvas(canvas);
        ctx.clearRect(0,0,canvas.width,canvas.height)
        const scaledWidth = canvas.width * scale;
        const scaledHeight = canvas.height * scale;

        const scaleOffsetX = (scaledWidth - canvas.width)/2;
        const scaleOffsetY = (scaledHeight - canvas.height)/2;
        setScaleOffset({ x: scaleOffsetX, y: scaleOffsetY});

        ctx.save()
        ctx.translate(panOffset.x * scale - scaleOffsetX ,panOffset.y * scale - scaleOffsetY);
        ctx.scale(scale,scale);

        if(imagePath){
            console.log("Image Path: " , imagePath)
            const img = new Image();
            img.src = URL.createObjectURL(imagePath);
            console.log("Image URL: ", img.src)
            img.onload = () =>{
                ctx.drawImage(img, 0, 0, 300, 300);
                URL.revokeObjectURL(img.src);
            };
        }

        
        elements?.forEach((element) =>{
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
        ctx.restore();
    },[elements,imagePath,panOffset,scale])


    return (
        <div className = "overflow-hidden">
            {action === 'writing' && (
            <textarea 
            ref = {textRef} 
            onBlur = {handleBlur}
            style = {{ top: `${(updatedElement.y - 2) * scale + panOffset.y * scale - scaleOffset.y}px`, left: `${updatedElement.x * scale + panOffset.x * scale - scaleOffset.x}px`, resize: "auto", whiteSpace: "pre", background: "transparent"}}
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
            <input ref = {imageRef} type = "file" className = "hidden" />
        </div>
    )
}

export default Canvas
