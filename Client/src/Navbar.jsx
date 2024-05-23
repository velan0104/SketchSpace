import React, { useState } from 'react'
import { FaArrowPointer, FaPen } from "react-icons/fa6";
import { MdOutlineRectangle, MdOutlineLightMode } from "react-icons/md";
import { FaRegCircle, FaArrowRight } from "react-icons/fa";
import { IoTriangleOutline } from "react-icons/io5";
import { GoDash } from "react-icons/go";
import { BiText, BiEraser } from "react-icons/bi";
import { RxTextAlignJustify } from "react-icons/rx";
import { useAuth } from './Controller.jsx';


const Navbar = () => {

    const { setCurrentElement, setDarkMode, darkMode, sideMenu, setFill, setBorderColor, setFillWeight, setFillStyle, setStrokeWidth, setRoughness, fillWeight, strokeWidth, roughness, currentElement,options,setOptions, undo, redo, setImage,image,save,setSave,clear,setClear,scale,setScale,onZoom} = useAuth();
    
    const handleSideBar = () =>{
        if(options) setOptions(false);
        else setOptions(true);
    }

    const handleImage = (e) =>{
        e.stopPropagation();
        setImage(!image);
    }

    const handleSave = (e) =>{
        e.stopPropagation();
        setSave(!save)
    }

    const handleClear = (e) =>{
        e.stopPropagation();
        setClear(!clear);
    }
    
  return (
    <>
        <nav className = "absolute top-5 w-full  flex justify-between px-5 dark:text-white">
            <div>
                <button 
                className = "h-12 px-5 border-2 border-red-500 rounded-md hover:bg-red-500 hover:text-white"
                onClick = {handleSideBar}>
                    <RxTextAlignJustify />
                </button>   
            </div>
            <div className = "flex gap-2">
                <button 
                className = " h-12 px-5 border-2 border-red-500 rounded-md hover:bg-red-500 hover:text-white"
                onClick = {() => setCurrentElement('pointer')}>
                    <FaArrowPointer/> 
                </button>
                <button 
                className = " h-12 px-5 border-2 border-red-500 rounded-md hover:bg-red-500 hover:text-white"
                onClick = {() => (setCurrentElement('rectangle'))}>
                    <MdOutlineRectangle/> 
                </button>
                <button 
                className = " h-12 px-5 border-2 border-red-500 rounded-md hover:bg-red-500 hover:text-white"
                onClick = {() => setCurrentElement('circle')}> 
                    <FaRegCircle/>
                </button>
                <button 
                className = " h-12 px-5 border-2 border-red-500 rounded-md hover:bg-red-500 hover:text-white"
                onClick = {() => setCurrentElement('triangle')}> 
                    <IoTriangleOutline/>
                </button>
                <button 
                className = " h-12 px-5 border-2 border-red-500 rounded-md hover:bg-red-500 hover:text-white"
                onClick = {() => setCurrentElement('line')}> 
                    <GoDash/>
                </button>
                <button 
                className = " h-12 px-5 border-2 border-red-500 rounded-md hover:bg-red-500 hover:text-white"
                onClick = {() => setCurrentElement('arrow')}> 
                    <FaArrowRight/>
                </button>
                <button 
                className = " h-12 px-5 border-2 border-red-500 rounded-md hover:bg-red-500 hover:text-white"
                onClick = {() => setCurrentElement('pen')}> 
                    <FaPen/>
                </button>
                <button 
                className = " h-12 px-5 border-2 border-red-500 rounded-md hover:bg-red-500 hover:text-white"
                onClick = {() => setCurrentElement('text')}> 
                    <BiText/>
                </button>
                <button 
                className = " h-12 px-5 border-2 border-red-500 rounded-md hover:bg-red-500 hover:text-white"
                onClick = {() => setCurrentElement('eraser')}> 
                    <BiEraser/>
                </button>
            </div>
            <div className = "flex gap-2">
                <button className = "h-12 px-5 border-2 border-red-500 rounded-md hover:bg-red-500 hover:text-white">
                    Share
                </button>
                <button 
                className = "h-12 px-5 border-2 border-red-500 rounded-md hover:bg-red-500 hover:text-white"
                onClick = {() => setDarkMode(!darkMode)}>
                    <MdOutlineLightMode/>
                </button>
            </div>

        </nav>

        <section className = "fixed bottom-10 left-10 flex gap-5 dark:text-white">
            <button onClick = {undo} className = "h-12 px-5 border-2 border-red-500 rounded-md hover:bg-red-500 hover:text-white"> Undo </button>
            <button onClick = {redo} className = "h-12 px-5 border-2 border-red-500 rounded-md hover:bg-red-500 hover:text-white"> Redo </button>
        </section>

        <section className = "fixed bottom-10 right-10 flex gap-5 dark:text-white">
            <button onClick = { () => onZoom(-0.01)}> - </button>
            <span onClick = {() => setScale(1)}> {new Intl.NumberFormat("en-GB", { style: "percent"}).format(scale)} </span>
            <button onClick = {() => onZoom(0.01)}> + </button>
        </section>
        {
            options && (
                <div className = "absolute top-24 mx-5 px-5 flex flex-col py-5 gap-5 bg-red-500 text-white rounded-md">
                    <button className = "text-left px-5" onClick = {handleSave}> Save As </button>
                    <button className = "text-left px-5" onClick = {handleClear}> Reset Canvas </button>
                    <button className = "text-left px-5" onClick = {handleImage}> Import Image </button>
                    <button className = "text-left px-5"> Collaboration </button>
                    <button className = "text-left px-5"> Theme </button>
                </div>
            )
        }
        {
            sideMenu && (
                <div className = "absolute top-24 mx-5 px-5 bg-red-500 text-white rounded-md py-6">
                    {(currentElement === 'pen') && 
                    (<div >
                        <h1> Size  </h1>
                        <div className = "flex gap-2 py-5">
                           <input type = "range" onChange = {(e) => setRoughness(e.target.value)}  value = {roughness} min = "0" max = "5" step = "1"/>
                           <input type = "number" value = {roughness} onChange = {(e) => setRoughness(e.target.value)} min = "0" max = "5" step = "1" className = "h-8 w-8 rounded-lg outline-none mx-5 text-black" readOnly/>
                        </div>
                    </div>)}
                    <div>
                        <h1> Stroke </h1>
                        <div className = "flex gap-2 py-5">
                            <button onClick = {setBorderColor('white')} className = "h-8 w-8 rounded-lg border-2 border-white bg-white"></button>
                            <button onClick = {setBorderColor('black')} className = "h-8 w-8 rounded-lg border-2 border-white bg-black"></button>
                            <button onClick = {setBorderColor('green')} className = "h-8 w-8 rounded-lg border-2 border-white bg-green-500"></button>
                            <button onClick = {setBorderColor('blue')} className = "h-8 w-8 rounded-lg border-2 border-white bg-blue-700"></button>
                            <button onClick = {setBorderColor('orange')} className = "h-8 w-8 rounded-lg border-2 border-white bg-orange-700"></button>
                            <input type = "color" className = "h-8 w-8 rounded-lg border-red outline-none"/>
                        </div>
                    </div>
                   {(currentElement !== 'line' && currentElement !== 'arrow' ) && (<div >
                        <h1> Fill </h1>
                        <div className = "flex gap-2 py-5">
                            <button onClick = {() => setFill('red')} className = "h-8 w-8 rounded-lg border-2 border-white bg-red-500"></button>
                            <button onClick = {() => setFill('green')} className = "h-8 w-8 rounded-lg border-2 border-white bg-green-500"></button>
                            <button onClick = {() => setFill('orange')} className = "h-8 w-8 rounded-lg border-2 border-white bg-orange-700"></button>
                            <button onClick = {() => setFill('blue')} className = "h-8 w-8 rounded-lg border-2 border-white bg-blue-700"></button>
                            <button onClick = {() => setFill('yellow')} className = "h-8 w-8 rounded-lg border-2 border-white bg-yellow-500"></button>
                            <input type = "color" className = "h-8 w-8 rounded-lg border-red outline-none"/>
                        </div>
                    </div>)}
                    {(currentElement === 'line' || currentElement === 'arrow' || currentElement === 'pen') &&
                    (<div >
                        <h1> Stroke Width </h1>
                        <div className = "flex gap-2 py-5">
                           <input type = "range" onChange = {(e) => setStrokeWidth(e.target.value)} value = {strokeWidth} min = "0" max = "10" step = "2"/>
                           <input type = "number" value = {strokeWidth} onChange = {(e) => setStrokeWidth(e.target.value)} min = "0" max = "10" step = "2" className = "h-8 w-8 rounded-lg outline-none mx-5 text-black" readOnly/> 
                        </div>
                    </div>)}
                    <div >
                        <h1> Roughness  </h1>
                        <div className = "flex gap-2 py-5">
                           <input type = "range" onChange = {(e) => setRoughness(e.target.value)}  value = {roughness} min = "0" max = "5" step = "1"/>
                           <input type = "number" value = {roughness} onChange = {(e) => setRoughness(e.target.value)} min = "0" max = "5" step = "1" className = "h-8 w-8 rounded-lg outline-none mx-5 text-black" readOnly/>
                        </div>
                    </div>
                    <div>
                        <h1> Fill Weight </h1>
                        <div className = "flex gap-2 py-5">
                           <input type = "range" onChange = {(e) => setFillWeight(e.target.value)} value = {fillWeight} min = "0" max = "10" step = "2"/>
                           <input type = "number" value = {fillWeight} onChange = {(e) => setFillWeight(e.target.value)} min = "0" max = "10" step = "2" className = "h-8 w-8 rounded-lg outline-none mx-5 text-black" readOnly/>
                        </div>
                    </div>
                    <div >
                        <h1> Fill Style </h1>
                        <div className = "flex gap-2 py-5">
                           <button onClick = {() => setFillStyle('solid')}className = "bg-white rounded-xl text-red-500 px-4 py-2 text-lg"> Solid </button>
                           <button onClick = {() => setFillStyle('dashed')}className = "bg-white rounded-xl text-red-500 px-4 py-2 text-lg"> Dashed </button>
                           <button onClick = {() => setFillStyle('zigzag')}className = "bg-white rounded-xl text-red-500 px-4 py-2 text-lg"> Zigzag </button>
                        </div>
                    </div>
                </div>
            )
        }
    </>
  )
}

export default Navbar
