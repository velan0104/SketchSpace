import { createContext, useContext ,useState, useEffect } from "react";
import rough from 'roughjs';
import { getStroke } from 'perfect-freehand'

export const context = createContext();

const useHistory = initialState => {
    const [index,setIndex] = useState(0);
    const [history,setHistory] = useState(() =>{
        const element = window.localStorage.getItem('DRAWING_ELEMENTS');
        if(!element) window.localStorage.setItem("DRAWING_ELEMENTS",[]);
        return (element) ? [JSON.parse(element)] : [initialState]
    });

    const setState = (action, overwrite = false) =>{
        const newState = typeof action === "function" ? action(history[index]) : action;
        if(overwrite) {
            const historyCopy = [...history];
            historyCopy[index] = newState;
            setHistory(historyCopy);
        }else{
            const updatedState = [...history].slice(0, index + 1);
            setHistory([...updatedState, newState]);
            setIndex(prevState => prevState + 1);
        }
    };
    
    const undo = () => index > 0 && setIndex(prevState => prevState - 1);
    const redo = () => index < history.length - 1 && setIndex(prevState => prevState + 1);

    return [history[index], setState, undo, redo];

}

const usePressedKeys = () =>{
    const [pressedKeys, setPressedKeys] = useState(new Set());

    useEffect(() =>{
        const handleKeyDown = event => {
            setPressedKeys(prevKeys => new Set(prevKeys).add(event.key));
        };
        
        const handleKeyUp = event => {
            setPressedKeys(prevKeys => {
                const updatedKeys = new Set(prevKeys);
                updatedKeys.delete(event.key);
                return updatedKeys;
            });
        }

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup",handleKeyUp);
        }
    },[])

    return pressedKeys;
}


export const AuthProvider = ({children}) =>{

    const [currentElement,setCurrentElement] = useState('pointer')
    const [handleDrawing,setHandleDrawing] = useState('');
    const [theme,setTheme] = useState(() =>{
        const storedTheme = window.localStorage.getItem('theme');
        return storedTheme ? JSON.parse(storedTheme): 'light';
    });
    const [fill,setFill] = useState('red');
    const [borderColor,setBorderColor] = useState('black');
    const [roughness,setRoughness] = useState('0');
    const [fillWeight,setFillWeight] = useState('3');
    const [fillStyle, setFillStyle] = useState('cross-hatch');
    const [elements, setElements, undo, redo] = useHistory([]);
    const [sideMenu,setSideMenu] = useState(false);
    const [isDrawing,setIsDrawing] = useState(false);
    const generator = rough.generator();
    const [strokeWidth, setStrokeWidth] = useState('3');
    const [inputPoints,setInputPoints] = useState([]);
    const [action,setAction] = useState('none');
    const [selectedTool,setSelectedTool] = useState(null);
    const [options,setOptions] = useState(false);
    const [image,setImage] = useState(false);
    const [save,setSave] = useState(false);
    const [clear,setClear] = useState(false);
    const [panOffset,setPanOffset] = useState({x: 0, y: 0});
    const [startPanMousePosition,setStartPanMousePosition] = useState({x: 0, y: 0});
    const [scale,setScale] = useState(1);
    const [scaleOffset,setScaleOffset] = useState({x:0,y:0});
    const pressedKeys = usePressedKeys();
    
    useEffect(() =>{
        if(currentElement !== 'pointer' || selectedTool !== null || selectedTool != undefined){
            setSideMenu('shapes')
            return;
        }
        else if(currentElement === 'pointer'){
            setSideMenu(null)
            return;
        }

    },[currentElement])
    
    useEffect(() =>{
        window.localStorage.setItem("theme", JSON.stringify(theme));
    },[theme])

    useEffect(() =>{
        localStorage.setItem("DRAWING_ELEMENTS", JSON.stringify(elements));
    },[elements])

    useEffect(() =>{
        const panOrZoomFunction = event =>{
            
            setPanOffset(prevState => ({
                x: prevState.x - event.deltaX,
                y: prevState.y - event.deltaY,
            }))
        };

        document.addEventListener('wheel', panOrZoomFunction);
        return () =>{
            document.removeEventListener("wheel", panOrZoomFunction);
        }
    },[])

    const average = (a, b) => (a + b) / 2;

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

    const getMouseCoordinates = event =>{
        const clientX = (event.clientX - panOffset.x * scale + scaleOffset.x)/scale;
        const clientY = (event.clientY - panOffset.y * scale + scaleOffset.y)/scale;
        return { clientX, clientY };
    }

    const onZoom = delta =>{
        setScale(prevState => Math.min(Math.max(prevState + delta, 0.1),2));
    }

    useEffect(() =>{
        const undoRedoFunction = event => {
            if((event.metaKey || event.ctrlKey) && event.key === "z"){
                if(event.shiftKey){
                    redo();
                }else{
                    undo();
                }
            }
        };

        document.addEventListener("keydown", undoRedoFunction);
        return () =>{
            document.removeEventListener("keydown",undoRedoFunction)
        }
    },[undo,redo])
   
    function createElement(id,x1,y1,x2,y2,type){

        if(type === 'line' ){
            const roughElement = generator.line(x1,y1,x2,y2, { stroke: borderColor, roughness: roughness, strokeWidth: 1, fillStyle: fillStyle});
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
            const roughElement = {x1: x1, y1: y1, x2: x2, y2: y2,fill: fill, stroke: borderColor,strokeWidth: 4}
            return {id:id,type: 'triangle', x1:x1,y1:y1,x2:x2,y2:y2,roughElement}
        }
        else if(type === 'arrow'){
            const roughElement = {x1:x1, y1: y1, x2: x2, y2: y2,fill: fill, stroke: borderColor,strokeWidth: 4}
            return { id:id,type:'arrow',x1,y1,x2,y2,roughElement}
        }
        else if(type === 'pen'){
            setInputPoints([...inputPoints, { x: x2, y: y2}])
            const stroke = getStroke(inputPoints,{
                smoothing: 0.99,
                size: 10,
            })
            const pathData = getSvgPathFromStroke(stroke);
            const roughElement = {shape: 'draw',fill: fill,x1: x1,y1:y1,x2: x2, y2: y2,path: pathData}
            return { id:id,type: 'pen',x1,y1,x2,y2,roughElement,points: inputPoints}
        }
        else if(type === 'text'){
            const roughElement = {}
            return { id: id, type: 'text', text: "",x1, y1, x2 ,y2, roughElement}
        }
        else if(currentElement === 'pointer'){
            setCurrentElement('pointer');
            setIsDrawing(false);
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
                return { x1, y1, x2: clientX, y2:clientY};
            case "top":
                return {x1: x1, y1:clientY, x2:x2, y2:y2};
            case "bottom": 
                return {x1:x1, y1:y1, x2:x2, y2: clientY};
            case "left":
                return {x1: clientX, y1:y1,x2:x2,y2:y2};
            case "right":
                return {x1: x1, y1:y1, x2: clientX, y2:y2};
            case "topCorner": 
                return {x1: clientX, y1: clientY, x2: x2, y2: y2};
            case "rightCorner":
            case "leftCorner":
                return {x1: x1, y1: y1, x2: clientX, y2: clientY};
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
            return { x1: minX, y1: minY, x2: maxX, y2: maxY, type: type};
        }
        else if(type === 'line') {
            if(x1 < x2 || (x1 === x2 && y1 < y2)){
                return { x1: x1, y1: y1, x2: x2, y2: y2,type: type };
            }
            else{
                return { x1: x2, y1: y2, x2: x1, y2: y1,type: type}
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
        // console.log(element)
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
            const top = nearPoint( x , y, x1, y1, "topCorner");
            const left = nearPoint( x, y, x3 , y2, "leftCorner");
            const right = nearPoint( x, y, x2, y2, "rightCorner");
            const inside = (x >= x3 && x <= x2 && y >= y1 && y <= y2) ? "inside" : null;
            return top || left || right || inside; 
        }
        else if(type === 'pen'){
            const betweenAnyPoint = element.points.some((point, index) =>{  
                const nextPoint = element.points[index + 1];
                if(!nextPoint) return false;
                return onLine(point.x,point.y,nextPoint.x,nextPoint.y,x,y,5) !== null;
            })

            return betweenAnyPoint ? "inside" : null;
        }else if(type === 'text'){
            return x >= x1 && x <= x2 && y >= y1 && y <= y2 ? "inside" : null;
        }

    }

    const distance = (a,b) =>{
        return Math.sqrt(Math.pow(a.x - b.x,2) + Math.pow(a.y - b.y,2));
    }

    const updateElement = (id,x1,y1,x2,y2,type,options) =>{
        // console.log("Options: " ,options)
        const copyElement = [...elements];
        if(type === 'text'){
            copyElement[id] = {
                ...createElement(id,x1,y1,x1 + 100, y1 + 24, type),
                text: options?.text,
            }
        }else{
            const element = createElement(id,x1,y1,x2,y2,type);
            copyElement[id] = element;
        }
        setElements(copyElement,true);
        // console.log("Copy Element: " , elements)
    }

    const cursorForPosition = position =>{
        switch(position){
            case "tl":
            case "br":
            case "start":
            case "end":
            case "rightCorner":
                return "nwse-resize";
            case "tr":
            case "bl":
            case "leftCorner":
                return "nesw-resize";
            case "top":
            case "bottom":
            case "topCorner": 
                return "n-resize";
            case "left":
            case "right":
                return "e-resize";
            default:
                return "move";
        }
    }

    const eraseElement = (element) =>{
        const elementAfterErase = elements.filter((currElement, index) =>{
            return element.id != index
        });
        setElements(elementAfterErase);
    }


    const handleMouseDown = (event) =>{
        if(action === 'writing') return;

        const {clientX, clientY} = getMouseCoordinates(event);

        if(event.button === 1){
            setAction("panning");
            setStartPanMousePosition({ x: clientX, y: clientY});
            return;
        }
        if(action === 'moving' || action === 'resizing'){
            setAction('none');
            return;
        }
        if(currentElement === 'pointer' || currentElement === 'eraser') {
            const element = getElementAtPosition(clientX, clientY)
            if(currentElement === 'eraser' && element){
                eraseElement(element);
                return;
            }
            if(element){
                setSelectedTool(element)
                if(element.type === 'pen'){
                    const xOffsets = element.points.map( point => clientX - point.x);
                    const yOffsets = element.points.map( point => clientY - point.y);
                    // console.log("X Offsets: " , xOffsets)
                    setSelectedTool({...element, xOffsets, yOffsets});
                }else{
                    const offsetX = clientX - element.x1;
                    const offsetY = clientY - element.y1;
                    setSelectedTool({...element,offsetX,offsetY})
                }
                setElements(prevState => prevState)
                if(element.position === 'inside'){
                    setAction('moving');
                }else{
                    setAction('resizing');
                }
            }
            // console.log("Current selected element: " , selectedTool)
        }
        else{
            setIsDrawing(true);
            const id = elements.length;
            const element = createElement(id,clientX, clientY,clientX,clientY,currentElement);
            if(element) setSelectedTool(element)
            setElements((prevElement) => [...prevElement,element]);
            setAction( currentElement === "text" ? "writing" : "drawing");
        }
    }

    const handleMouseMove = (event) =>{
        // console.log("currentElement: " , currentElement)
        const { clientX, clientY } = getMouseCoordinates(event);

        if(action === "panning"){
            const deltaX = clientX - startPanMousePosition.x;
            const deltaY = clientY - startPanMousePosition.y;
            setPanOffset( prevState => ({
                x: prevState.x + deltaX,
                y: prevState.y + deltaY,
            }))
            return;
        }

        if(currentElement === 'pointer' || currentElement === 'eraser'){
            const element = getElementAtPosition(clientX, clientY);
            if(currentElement === 'eraser') event.target.style.cursor = "cursor-cell";
            else event.target.style.cursor = element?.position ? cursorForPosition(element.position): "default";
            if( selectedTool !== null && selectedTool !== undefined){
                const {id,x1,y1,x2,y2,type} = selectedTool;
                if(action === 'moving' && (type === 'rectangle' || type === 'line' || type === 'circle' || type === 'arrow' || type === "triangle" || type === "text" )){
                    const newX1 = clientX - selectedTool.offsetX;
                    const newY1 = clientY - selectedTool.offsetY;
                    const width = x2 - x1;
                    const height = y2 - y1; 
                    const options = (type === "text") ? { text: selectedTool.text } : {};
                    console.log("Options at Mouse move: " , options)
                    updateElement(id,newX1,newY1,newX1 + width,newY1 + height,type,options);
                }
                else if(action === 'moving' && type === 'pen'){
                    const newPoints = selectedTool.points.map((_,index) => ({
                       x: clientX - selectedTool.xOffsets[index],
                       y: clientY - selectedTool.yOffsets[index],
                    }));
                    const elementsCopy = [...elements];
                    elementsCopy[selectedTool.id] = {
                        ...elementsCopy[selectedTool.id],
                        points: newPoints,
                    };
                    // const {id, x1,x2,y1,y2,type} = selectedTool;
                    // setInputPoints(newPoints)
                    // createElement(id,x1,y1,x2,y2,type);
                    setElements(elementsCopy,true)
                }else if(action === 'resizing' && (type === 'rectangle' || type === 'line' || type==='circle' || type === 'triangle' || type === 'arrow')){
                    const {id,type,position,...coordinates} = selectedTool;
                    const { x1, y1, x2, y2} = resizedCoordinates(clientX,clientY,position,coordinates);
                    updateElement(id,x1,y1,x2,y2,type);
                }
            }
        }   
        else{
            if(isDrawing){
                const index = elements.length - 1;
                const {id,x1,y1,type} = elements[index];
                updateElement(id,x1,y1,clientX,clientY,type,{text: ""})
            }
        }
    }

    const handleMouseUp = (event) =>{
        const {clientX, clientY} = getMouseCoordinates(event);
        if(selectedTool){
            const id = selectedTool.id;
            if((action === 'drawing' || action === 'resizing') && (selectedTool.type !== 'pen' || currentElement !== 'pen')){
                if(selectedTool.type === 'rectangle' || selectedTool.type === 'line'){
                    const {x1,y1,x2,y2,type} = adjustElementCoordinates(elements[id]);
                    updateElement(id,x1,y1,x2,y2,type);
                }
            }else if(selectedTool.type === 'text' && clientX - selectedTool.offsetX === selectedTool.x1 && clientY - selectedTool.offsetY === selectedTool.y1){
                setAction("writing");
                return;
            }
        }
        
        if (action === "writing") return;
        setCurrentElement('pointer');
        console.log(currentElement)
        if(selectedTool) setSelectedTool(null)
            
        if(inputPoints) setInputPoints([])
        setIsDrawing(false);
        setAction('none');
        
    }

    const handleBlur = event =>{
        const { id, x1, y1, type} = selectedTool;
        setAction("none");
        setSelectedTool(null);
        setCurrentElement('pointer');
        // console.log("Content: ", event.target.value);
        updateElement(id,x1,y1,null,null, type, {text: event.target.value});
    }


    return(
        <context.Provider value = {{theme,setTheme,elements,handleDrawing,setHandleDrawing,handleMouseUp,handleMouseDown,handleMouseMove,setCurrentElement,currentElement,sideMenu,setFill,setFillWeight,setBorderColor,roughness,setRoughness,setFillStyle,inputPoints,setInputPoints,setStrokeWidth,strokeWidth,options,setOptions,undo,redo,handleBlur,action,image,setImage,save,setSave,clear,setClear,setElements,panOffset,setPanOffset,scale,setScale,onZoom,setScaleOffset,scaleOffset}}>
            {children}
        </context.Provider>
    )
}

export const useAuth = () =>{
    return useContext(context);
}



        // if(localStorage.getItem("DrawingElements")){
        //     let currentState = JSON.parse(localStorage.getItem("DrawingElements"));
        //     if(currentState !== null){
        //         setElements(currentState);
        //     }
        // }else{
        //     localStorage.setItem("DrawingElements",JSON.stringify(elements))
        // }