import React, { useState, useEffect } from 'react'
import { MdClose,
  MdMenu,
  MdAdd,
  MdOutlineLogout,
  MdOutlineQuestionAnswer,
 } from 'react-icons/md'
import { CiChat1 } from 'react-icons/ci'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import bot from '../assets/bot.ico'
import DarkMode from './DarkMode'
import { auth } from '../firebase'
import { useLocation } from "react-router-dom";
import Notification from './Notification';

/**
 * A sidebar component that displays a list of nav items and a toggle 
 * for switching between light and dark modes.
 * 
 * @param {Object} props - The properties for the component.
 */
const SideBar = ({user}) => {
  const [open, setOpen] = useState(true)
  const [userData, setUserData] = useState(user)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const roomId = location.pathname.split("/room/")[1];
  const [notification, setNotification] = useState({show: false, message: ''});

  function handleResize() {
    window.innerWidth <= 768 ? setOpen(false) : setOpen(true)
  }

  useEffect(() => {
    handleResize()
    window.addEventListener("resize", handleResize)
    GetUserRooms()

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, []);
  
  const newChat = () => {
    window.location.href = process.env.REACT_APP_PUBLIC_URL;
  }

  const SignOut = () => {
    if (auth.currentUser) {
      auth.signOut()
      window.sessionStorage.clear()
    }
  }

  const handleShowNotification = (message) => {
    setNotification({
      show: true,
      message: message,
    });
  }

  const GetUserRooms = async () => {
    const BASE_URL = process.env.REACT_APP_BASE_URL;
    const params = new URLSearchParams({ id: userData.uid });
    let data;
    try {
      const response = await fetch(`${BASE_URL}get-rooms?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      });
      data = await response.json();
      if (data) {
        setUserData(prevState => ({...prevState, rooms: data}));
      }
    } catch (error) {
      handleShowNotification(`The server is not responding, try again later.`)
      setError(error);
    } finally {
      setLoading(false);
      if(roomId){
        document.title = getItemNameById(data, roomId);
      }
    }
  };

  const getItemNameById = (data, id) => {
    const item = data.find((item) => item.ID === id);
    return item ? item.Name : null;
  };

  const renderRooms = () => {
    if (loading) {
      return <AiOutlineLoading3Quarters />;
    }

    if (error) {
      return <p className='message__markdown'>Oops, something went wrong!</p>;
    }

    if (!userData.rooms || userData.rooms.length === 0) {
      return <p className='message__markdown'>No rooms available</p>;
    }

    return (
      <div className='menu'>
          {userData.rooms.map(room => 
            <a key={room.ID} href={process.env.REACT_APP_PUBLIC_URL + 'room/' + room.ID} title={room.Name}>
              <div className={`nav ${room.ID === roomId ? 'active' : ''}`}>
                <span className="nav__item">
                  <div className="nav__icons">
                    <CiChat1 />
                  </div>
                  <div className='flex-1 text-ellipsis max-h-5 overflow-hidden break-all relative'>
                    {room.Name}
                    <div className="right-shadow"></div>
                  </div>
                </span>
              </div>
            </a>)
          }
      </div>
    );
  };


  return (
    <section className={` ${open ? "w-64" : "w-16"} sidebar`}>
      <div className="sidebar__app-bar">
        <div className={`sidebar__app-logo ${!open && "scale-0 hidden"} `}>
          <span className='w-8 h-8'><img src={bot} alt="" /></span>
        </div>
        <h1 className={`sidebar__app-title ${!open && "scale-0 hidden"}`}>
          GPT
        </h1>
        <div className='sidebar__btn-close' onClick={() => setOpen(!open)}>
          {open ? <MdClose className='sidebar__btn-icon' /> : <MdMenu className='sidebar__btn-icon' />}

        </div>
      </div>
      <div className="nav">
        <span className='nav__item bg-light-white' onClick={newChat}>
          <div className='nav__icons'>
            <MdAdd />
          </div>
          <h1 className={`${!open && "hidden"}`}>New chat</h1>
        </span>
      </div>
      <div className={`${!open && "hidden"} nav`}>
        {renderRooms()}
      </div>

      <div className="nav__bottom">
        <DarkMode open={open} />
        <div className="nav">
          <a target="_blank" rel="noreferrer" href='https://help.openai.com/en/collections/3742473-chatgpt' className="nav__item">
            <div className="nav__icons">
              <MdOutlineQuestionAnswer />
            </div>
            <h1 className={`${!open && "hidden"}`}>Update & FAQ</h1>
          </a>
        </div>
        <div className="nav">
          <span className="nav__item" onClick={SignOut}>
            <div className="nav__icons">
              <MdOutlineLogout />
            </div>
            <h1 className={`${!open && "hidden"}`}>Log out</h1>
          </span>
        </div>
      </div>
      <div>
        {notification.show && (
          <Notification message={notification.message} />
        )}
      </div>
    </section>
  )
}

export default SideBar