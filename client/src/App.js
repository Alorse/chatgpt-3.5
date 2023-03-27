import Home from './pages/Home'
import SignIn from './pages/SignIn'
import { ChatContextProvider } from './context/chatContext'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useState, useEffect } from "react";
import bot from './assets/logo.ico'

import { auth } from './firebase'


const App = () => {
  const [user] = useAuthState(auth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  return (
    <ChatContextProvider>
      {isLoading ? (
        <div className='signin'>
          <img src={bot} alt="logo" />
        </div>
      ) : (
        <div>
          {user ? <Home user={user} /> : <SignIn />}
        </div>
      )}
    </ChatContextProvider>
  );
};


export default App