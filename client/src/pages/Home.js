import SideBar from '../components/SideBar';
import ChatView from '../components/ChatView';
import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom';

const Home = ({user}) => {
  return (
    <Router>
    <div className="flex transition duration-500 ease-in-out">
      <SideBar user={user} />
      <ChatView />
    </div>
    </Router>
  )
}

export default Home