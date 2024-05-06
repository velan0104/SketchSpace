import React from "react"
import Canvas from "./Canvas"
import Navbar from "./Navbar"
import { useAuth } from "./Controller"

function App() {
  const { darkMode } = useAuth();

  return (
    <>
      <div className = {darkMode ? 'dark' : ''}>
        <Canvas/>
        <Navbar/>
      </div>
        
    </>
  )
}

export default App
