import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Chat from './pages/chat/chat'
import Login from './pages/login/login'
import ProfileUpdate from './pages/profileUpdate/profileUpdate'

const App = () => {
  return (
    <>
      <Routes>
        <Route path= '/' element={<Login />} />
        <Route path='/chat' element={<Chat />} />
        <Route path='/profileUpdate' element={<ProfileUpdate/>}/>

      </Routes>
    </>
  )
}

export default App
