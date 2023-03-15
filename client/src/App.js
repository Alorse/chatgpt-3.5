import Home from './pages/Home'
import SignIn from './pages/SignIn'
import { ChatContextProvider } from './context/chatContext'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useState, useEffect } from "react";
import bot from './assets/bot.ico'

import { auth } from './firebase'


const App = () => {
  const [user] = useAuthState(auth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  }, []);

  return (
    <ChatContextProvider>
      {isLoading ? (
        <div className='signin'>
          <img className='w-8 h-8' src={bot} alt="" />
        </div>
      ) : (
        <div>
          {user ? <Home /> : <SignIn />}
        </div>
      )}
    </ChatContextProvider>
  );
};


export default App