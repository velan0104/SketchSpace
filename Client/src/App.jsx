import React from "react"
import Canvas from "./Canvas"
import Navbar from "./Navbar"
import { useAuth } from "./Controller"

function App() {
  const { theme } = useAuth();

  return (
    <>
      <div className = {theme == 'dark' ? 'dark' : 'light'}>
        <Canvas/>
        <Navbar/>
      </div>
        
    </>
  )
}

export default App
