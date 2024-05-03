import { createContext, useContext ,useState, useEffect } from "react";
import rough from 'roughjs';
import { getStroke } from 'perfect-freehand'

export const context = createContext();

export const AuthProvider = ({children}) =>{
    const [currentElement,setCurrentElement] = useState('pointer')
    const [handleDrawing,setHandleDrawing] = useState('');
    const [darkMode,setDarkMode] = useState(false);
    const [fill,setFill] = useState('red');
    const [borderColor,setBorderColor] = useState('black');
    const [roughness,setRoughness] = useState('0');
    const [fillWeight,setFillWeight] = useState('3');
    const [fillStyle, setFillStyle] = useState('cross-hatch');
    const[elements, setElements] = useState([]);
    const [sideMenu,setSideMenu] = useState(false);
    const [isDrawing,setIsDrawing] = useState(false);
    const [text,setText] = useState("");
    const generator = rough.generator();
    const [strokeWidth, setStrokeWidth] = useState('3');
    const [showInput,setShowInput] = useState('');
    const [inputPoints,setInputPoints] = useState([]);
    const [action,setAction] = useState('none');
    const [cursor,setCursor] = useState('default')
    const [selectedElement,setSelectedElement] = useState(null)

    useEffect(() =>{
        if(currentElement === 'rectangle' || currentElement === 'circle' || currentElement === 'line' || currentElement === 'triangle' || currentElement === 'pen' || currentElement === 'arrow'){
            setSideMenu('shapes')
            return;
        }
        else if(currentElement === 'pointer'){
            setSideMenu(null)
            return;
        }
        else if(currentElement === 'images'){
            createElement(100,100,100,100);
        }

    },[currentElement])

    useEffect(() =>{
        if(selectedElement !== 'none'){
            setCursor('move')
        }else{
            setCursor('default')
        }
        console.log("Frome Selected Element: ")
        console.log(selectedElement)
    },[selectedElement])

    const average = (a, b) => (a + b) / 2

    function getSvgPathFromStroke(points, closed = true) {
        const len = points.length
      
        if (len < 4) {
          return ``
        }
      
        let a = points[0]
        let b = points[1]
        const c = points[2]
      
        let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(
          2
        )},${b[1].toFixed(2)} ${average(b[0], c[0]).toFixed(2)},${average(
          b[1],
          c[1]
        ).toFixed(2)} T`
      
        for (let i = 2, max = len - 1; i < max; i++) {
          a = points[i]
          b = points[i + 1]
          result += `${average(a[0], b[0]).toFixed(2)},${average(a[1], b[1]).toFixed(
            2
          )} `
        }
      
        if (closed) {
          result += 'Z'
        }
      
        return result
    }
   
    function createElement(id,x1,y1,x2,y2,type){
        // console.log(currentElement)
        if(type === 'line' ){
            const roughElement = generator.line(x1,y1,x2,y2, { stroke: borderColor, roughness: roughness, strokeWidth: strokeWidth, fillStyle: fillStyle ,dashArray: [100,50]});
            setSideMenu('shapes')
            return {id:id,type: 'line',x1: x1, y1: y1, x2: x2, y2: y2, roughElement };
        }
        else if(type === 'rectangle'){
            const roughElement = generator.rectangle(x1,y1,x2-x1,y2-y1, { fill: fill ,stroke:  borderColor,strokeWidth: 1,fillWeight: fillWeight,roughness: roughness, fillStyle: fillStyle});
            setSideMenu('shapes');
            return { id:id,type: 'rectangle',x1: x1, y1: y1, x2: x2, y2: y2, roughElement };
        }
        else if(type === 'circle'){
            const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            const centerX = (x1 + x2) / 2;
            const centerY = (y1 + y2) / 2;
            const roughElement = generator.circle(centerX,centerY,radius,{ fill: fill, fillWeight: fillWeight,strokeWidth: 3,roughness: roughness,fillStyle: fillStyle});
            setSideMenu('shapes')
            return { id:id,type: 'circle',x1: x1, y1: y1, x2: x2, y2: y2 ,centerX: centerX,centerY: centerY,radius: radius, roughElement };
        }
        else if(type === 'triangle'){
            const roughElement = {shape: 'triangle',x1: x1, y1: y1, x2: x2, y2: y2,fill: fill, stroke: borderColor,strokeWidth: 4}
            return {id:id,type: 'triangle', x1:x1,y1:y1,x2:x2,y2:y2,roughElement}
        }
        else if(currentElement === 'pointer'){
            setCurrentElement('pointer');
            setIsDrawing(false);
        }
        else if(type === 'arrow'){
            const roughElement = {shape: 'arrow', x1:x1, y1: y1, x2: x2, y2: y2,fill: fill, stroke: borderColor,strokeWidth: 4}
            return { id:id,type:'arrow',x1,y1,x2,y2,roughElement}
        }
        else if(type === 'text'){
            const roughElement = {shape: 'pen',text: text,fill: fill,x: x1, y: y1};
            return { id:id,type: 'text',x1,y1,x2,y2,roughElement}
        }
        else if(currentElement === 'pen'){
            setInputPoints([...inputPoints, [x2, y2]])
            const stroke = getStroke(inputPoints,{
                smoothing: 0.99,
                size: 50,
            })
            const pathData = getSvgPathFromStroke(stroke);
            const roughElement = {shape: 'draw',fill: fill,x1: x1,y1:y1,x2: x2, y2: y2,points: inputPoints,path: pathData}
            return { id:id,type: 'pen',x1,y1,x2,y2,roughElement}
        }
        else if (currentElement === 'images'){
            setIsDrawing(false)
            // console.log("Current Element is images")
            const roughElement = {shape: 'images',id:id, x1: x1, y1: y1, x2: x2, y2: y2};
            const element = {x1,y1,x2,y2,roughElement};
            setElements((prevElement) => [...prevElement,element])
            return;
        }

    }

    const resizedCoordinates = (clientX, clientY, position, coordinates) => {
        const { x1, y1, x2, y2 } = coordinates;
        switch(position){
            case "tl":
            case "start": 
                return { x1: clientX, y1: clientY, x2, y2 };
            case "tr":
                return {x1, y1: clientY, x2: clientX, y2 };
            case "bl":
                return { x1: clientX, y1, x2, y2: clientY };
            case "br":
            case "end":
                return { x1, y1, x2: clientX, clientY};
            case "top":
                return {x1: x1, y1:clientY, x2:x2, y2:y2};
            case "bottom": 
                return {x1:x1, y1:y1, x2:x2, y2: clientY};
            case "left":
                return {x1: clientX, y1:y1,x2:x2,y2:y2};
            case "right":
                return {x1: x1, y1:y1, x2: clientX, y2:y2};
            default:
                return null;
        }
    }
    const getElementAtPosition = (x,y) =>{
        return elements
                .map(element => ({...element, position: positionWithinElement(x,y,element)}))
                .find( element => positionWithinElement(x,y,element))
    }

    const adjustElementCoordinates = (element) =>{
        const { type, x1, y1, x2, y2 } = element;
        if(type === 'rectangle'){
            const minX = Math.min(x1,x2);
            const maxX = Math.max(x1,x2);
            const minY = Math.min(y1,y2);
            const maxY = Math.max(y1,y2);
            return { x1: minX, y1: minY, x2: maxX, y2: maxY }
        }
        else if(type === 'line') {
            if(x1 < x2 || (x1 === x2 && y1 < y2)){
                return { x1, y1, x2, y2 };
            }
            else{
                return { x1: x2, y1: y2, x2: x1, y2: y1}
            }
        }
    }

    const nearPoint = (x, y, x1, y1, name) => {
        return Math.abs(x - x1) < 5 && Math.abs(y - y1) < 5 ? name : null;
    }

    const onLine = (x1, y1, x2, y2, x, y, maxDistance = 1) =>{
        const a = {x: x1, y: y1};
        const b = {x: x2, y: y2};
        const c = { x , y};
        const offset = distance(a,b) - (distance(a,c) + distance(b,c));
        return Math.abs(offset) < maxDistance ? "inside" : null;
    }

    const positionWithinElement = (x,y,element) => {
        const {type,x1,y1,x2,y2} = element;
        if(type === 'rectangle'){
            const topLeft = nearPoint(x, y, x1, y1, "tl");
            const topRight = nearPoint(x, y, x2, y1, "tr");
            const bottomLeft = nearPoint(x, y, x1, y2, "bl");
            const bottomRight = nearPoint(x, y, x2, y2, "br");
            const inside = ( x >= x1 && x <= x2 && y >= y1 && y <= y2) ? "inside" : null;
            return topLeft || topRight || bottomLeft || bottomRight || inside;
        }
        else if(type === 'circle'){
            const { centerX, centerY, radius} = element;
            const top = nearPoint(x,y,centerX, centerY - radius/2, "top")
            const bottom = nearPoint(x,y,centerX,centerY + radius/2,"bottom");
            const left = nearPoint(x,y,centerX - radius/2,centerY,"left")
            const right = nearPoint(x, y, centerX + radius,centerY,"bottom")
            const inside = (x >= x1 - 30 && x <= x2 +30 && y >= y1 - 30 && y <= y2 +30) ? "inside" : null;
            return top || bottom || left || right || inside;
        }
        else if(type === 'line' || type  === 'arrow'){
           const on = onLine(x1,y1,x2,y2,x,y);
           const start = nearPoint(x, y, x1, y1, "start");
           const end = nearPoint(x, y, x2, y2, "end");
           return start || end || on
        }
        else if(type === 'triangle' ){
            const x3 = x1 - (x2 - x1)
            const minX = Math.min(x3,x2);
            const maxX = Math.max(x3,x2);
            const minY = Math.min(y1,y2);
            const maxY = Math.max(y1,y2);
            // return x >= x3 && x <= x2 && y >= y1 && y <= y2;
            return x >= minX && x <= maxX && y >= minY && y <= maxY;
        }

    }

    const distance = (a,b) =>{
        return Math.sqrt(Math.pow(a.x - b.x,2) + Math.pow(a.y - b.y,2));
    }

    const updateElement = (id,x1,y1,x2,y2,type) =>{
        const element = createElement(id,x1,y1,x2,y2,type);
        const copyElement = [...elements];
        copyElement[id] = element;
        setElements(copyElement)
    }

    const cursorForPosition = position =>{
        switch(position){
            case "tl":
            case "br":
            case "start":
            case "end":
                return "nwse-resize";
            case "tr":
            case "bl":
                return "nesw-resize";
            case "top":
            case "bottom":
                return "n-resize";
            case "left":
            case "right":
                return "e-resize";
            case "inside":
                return "move";
            default:
                return "default";
        }
    }

    const handleMouseDown = (event) =>{
        // console.log(currentElement)
        if(action === 'moving' || action === 'resizing'){
            setAction('none');
            return;
        }
        const {clientX, clientY} = event;
        if(currentElement === 'pointer' ) {
            const element = getElementAtPosition(clientX, clientY)
            setSelectedElement(element)
            console.log(selectedElement)
            const offsetX = clientX - element.x1;
            const offsetY = clientY - element.y1;
            setSelectedElement({...element,offsetX,offsetY})
            if(element.position === 'inside'){
                setAction('moving');
            }else{
                setAction('resizing');
            }
        }
        else{
            // console.log(currentElement)
            // setAction('drawing')
            setIsDrawing(true);
            const index = elements.length;
            const id = index;
            const element = createElement(id,clientX, clientY,clientX,clientY,currentElement);
            setElements((prevElement) => [...prevElement,element]);
        }
    }

    const handleMouseMove = (event) =>{
        const { clientX, clientY} = event;
        // console.log("x: " + clientX + " y: " + clientY)
        if(currentElement === 'pointer' && selectedElement !== null && selectedElement !== undefined){
            const element = getElementAtPosition(clientX, clientY);
            // console.log(element.position)
            event.target.style.cursor = element ? cursorForPosition(element.position) : "default"
            const {id,x1,y1,x2,y2,type,offsetX,offsetY} = selectedElement;
            const newX1 = clientX - offsetX;
            const newY1 = clientY - offsetY;
            
            if(selectedElement != null ){
                // console.log("moving")
                if(action === 'moving' && (type === 'rectangle' || type === 'line' || type === 'circle' || type === 'arrow' || type === "triangle")){
                    const width = x2 - x1;
                    const height = y2 - y1; 
                    updateElement(id,newX1,newY1,newX1 + width,newY1 + height,type);
                }else if(action === 'resizing' && (type === 'rectangle' || type === 'line' || type==='circle')){
                    const {id,type,position,...coordinates} = selectedElement;
                    const { x1, y1, x2, y2} = resizedCoordinates(clientX,clientY,position,coordinates);
                    updateElement(id,x1,y1,x2,y2,type);
                }

            }
        }   
        else{
            if(isDrawing){
            const index = elements.length - 1;
            const {id,x1,y1,type} = elements[index];
            updateElement(id,x1,y1,clientX,clientY,type)}
        }
        
    }

    const handleMouseUp = (e) =>{
        console.log(" Mouse Up")

        if(selectedElement){
            const index = selectedElement.id;
            if(action === 'drawing' || action === 'resizing'){
                const {x1,y1,x2,y2} = adjustElementCoordinates(elements[index]);
                updateElement(id,x1,y1,x2,y2,type);
            }
        }
        setAction('none');
        
        if(selectedElement) setSelectedElement(null)
        if(currentElement != 'pointer'){
            setSelectedElement('null')
        }
        setCurrentElement('pointer')
        console.log(currentElement)
        
        if(inputPoints) setInputPoints([])
        setIsDrawing(false);
        console.log(action)
        
    }


    return(
        <context.Provider value = {{darkMode,setDarkMode,elements,handleDrawing,setHandleDrawing,showInput,handleMouseUp,handleMouseDown,handleMouseMove,setCurrentElement,currentElement,sideMenu,setFill,setFillWeight,setBorderColor,roughness,setRoughness,setFillStyle,text,setText,inputPoints,setInputPoints,setStrokeWidth,strokeWidth,cursor}}>
            {children}
        </context.Provider>
    )
}

export const useAuth = () =>{
    return useContext(context);
}