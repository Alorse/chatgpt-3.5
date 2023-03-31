import React, { useState, useEffect } from 'react'
import {
  MdMenu,
  MdAdd,
  MdOutlineLogout,
  MdOutlineQuestionAnswer,
} from 'react-icons/md'
import { BsChatLeft } from 'react-icons/bs'
import { BiRename, BiCheck } from 'react-icons/bi'
import { MdDeleteForever, MdClose } from 'react-icons/md'
import bot from '../assets/logo.ico'
import DarkMode from './DarkMode'
import Thinking from './Thinking'
import { auth } from '../firebase'
import { useLocation } from "react-router-dom";
import Notification from './Notification';
import Modal from './Modal';

/**
 * A sidebar component that displays a list of nav items and a toggle 
 * for switching between light and dark modes.
 * 
 * @param {Object} props - The properties for the component.
 */
const SideBar = ({ user }) => {
  const [open, setOpen] = useState(true)
  const [userData, setUserData] = useState(user)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const roomId = location.pathname.split("/room/")[1];
  const [notification, setNotification] = useState({ show: false, message: '' });
  const [isOpen, setIsOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const BASE_URL = process.env.REACT_APP_BASE_URL;

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

  function handleOpenModal(e) {
    e.preventDefault()
    setIsOpen(true);
  }

  function handleEditRoomName(e, room) {
    e.preventDefault()
    setEditingRoomId(room.ID);
    if (room.ID != null) {
      setTimeout(() => {
        document.getElementById(`room-name-input-${room.ID}`).focus()
      }, 100)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSaveRoomName(e)
    }
  }

  function handleSaveRoomName(e) {
    e.preventDefault()
    // Obtener el nuevo nombre de la sala desde un input
    const newName = document.getElementById(`room-name-input-${roomId}`).value;
    // Llamar al endpoint de actualización de nombre
    fetch(`${BASE_URL}rename-room/${roomId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: newName }),
    })
      .then((response) => response.json())
      .then((data) => {
        setTimeout(() => {
          document.getElementById(`room-name-span-${roomId}`).innerHTML = newName
        }, 100)
        setEditingRoomId(null);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  function handleCloseModal() {
    setIsOpen(false);
  }

  function handleDelete() {
    fetch(`${BASE_URL}delete-room/${roomId}`, {
      method: 'DELETE'
    })
      .then(response => {
        if (response.ok) {
          setIsOpen(false);
          newChat()
        } else {
          // La solicitud falló
          throw new Error('Error en la solicitud DELETE');
        }
      })
      .catch(error => {
        // Manejar el error aquí
        console.error(error);
      });
  }

  const GetUserRooms = async () => {
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
        setUserData(prevState => ({ ...prevState, rooms: data }));
      }
    } catch (error) {
      handleShowNotification(`The server is not responding, try again later.`)
      setError(error);
    } finally {
      setLoading(false);
      if (roomId) {
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
      return <Thinking />;
    }

    if (error) {
      return <p className='message__markdown'>Oops, something went wrong!</p>;
    }

    if (!userData.rooms || userData.rooms.length === 0) {
      return <p className='message__markdown'>No rooms available</p>;
    }

    return (
      <div className="menu">
        {userData.rooms.map((room) => (
          <a
            key={room.ID}
            href={editingRoomId !== room.ID ? process.env.REACT_APP_PUBLIC_URL + "room/" + room.ID : '#'}
            title={room.Name}
          >
            <div
              className={`nav ${room.ID === roomId ? "active" : ""}`}
            >
              <span className="nav__item">
                <div className="nav__icons">
                  <BsChatLeft />
                </div>
                {editingRoomId === room.ID ? (
                  <div className="flex items-center">
                    <input
                      id={`room-name-input-${room.ID}`}
                      type="text"
                      defaultValue={room.Name}
                      onKeyDown={handleKeyDown}
                      className="flex-1 text-ellipsis max-h-5 overflow-hidden break-all relative p-1 bg-dark-grey outline-0"
                    />
                    <button
                      className="text-lg"
                      onClick={handleSaveRoomName}
                    >
                      <BiCheck />
                    </button>
                    <button
                      className="text-lg"
                      onClick={(e) => handleEditRoomName(e, {room:{ID: null}})}
                    >
                      <MdClose />
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 text-ellipsis max-h-5 overflow-hidden break-all relative">
                    <span id={`room-name-span-${room.ID}`}>{room.Name}</span>
                    <div className="right-shadow"></div>
                  </div>
                )}
                <div
                  className={`nav ${room.ID === roomId ? "flex right-1 z-10 text-gray-300 visible" : "hidden"
                    }`}
                >
                  {editingRoomId !== room.ID && (
                    <>
                      <button
                        className="text-lg p-1 hover:text-white"
                        onClick={(e) => handleEditRoomName(e, room)}
                        title="Rename room"
                      >
                        <BiRename />
                      </button>
                      <button
                        className="text-lg p-1 hover:text-white"
                        onClick={handleOpenModal}
                        title="Delete room"
                      >
                        <MdDeleteForever />
                      </button>
                    </>
                  )}
                </div>
              </span>
            </div>
          </a>
        ))}
      </div>
    );
  };


  return (
    <section className={`sidebar ${open ? "w-64" : "w-12"}`}>
      <div className="sidebar__app-bar">
        <div className={`sidebar__app-logo ${!open && "scale-0 hidden"}`} onClick={() => setOpen(!open)}>
          <span><img className='w-16 h-16' src={bot} alt="GPT" /></span>
        </div>
        <div className={`sidebar__btn-close ${open && " hidden"}`} onClick={() => setOpen(!open)}>
          <MdMenu className='sidebar__btn-icon' />
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
      <div className={`${!open && "hidden"} rooms`}>
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
      <Modal isOpen={isOpen} onClose={handleCloseModal} onDelete={handleDelete} />
    </section>
  )
}

export default SideBar