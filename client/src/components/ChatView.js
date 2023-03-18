import React, { useState, useRef, useEffect, useContext, useCallback } from 'react'
import ChatMessage from './ChatMessage'
import { ChatContext } from '../context/chatContext'
import { auth } from '../firebase'
import Thinking from './Thinking'
import { MdSend } from 'react-icons/md'
import Notification from './Notification';
import { useLocation } from "react-router-dom";
import { AiOutlineLoading3Quarters } from 'react-icons/ai'

/**
 * A chat view component that displays a list of messages and a form for sending new messages.
 */
const ChatView = () => {
  const messagesEndRef = useRef()
  const inputRef = useRef()
  const [formValue, setFormValue] = useState('')
  const [thinking, setThinking] = useState(false)
  const options = ['ChatGPT', 'DALL·E']
  const [selected, setSelected] = useState(options[0])
  const [room, setRoom] = useState(null)
  const [messages, addMessage, ] = useContext(ChatContext)
  const user = auth.currentUser.uid
  const picUrl = auth.currentUser.photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'
  const colors = ['red', 'yellow', 'green', 'blue'];
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState(colors[Math.floor(Math.random() * colors.length)]);
  const [loading, setLoading] = useState(true);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const roomId = location.pathname.split("/room/")[1];

  /**
   * Scrolls the chat area to the bottom.
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  /**
   * Adds a new message to the chat.
   *
   * @param {string} newValue - The text of the new message.
   * @param {boolean} [ai=false] - Whether the message was sent by an AI or the user.
   */
  const updateMessage = (newValue, ai = false, selected) => {
    const id = Date.now() + Math.floor(Math.random() * 1000000)
    const newMsg = {
      id: id,
      createdAt: Date.now(),
      text: newValue,
      ai: ai,
      selected: `${selected}`
    }

    addMessage(newMsg)
  }

  const GetUserMessages = useCallback(async () => {
    const BASE_URL = process.env.REACT_APP_BASE_URL;
    const params = new URLSearchParams({ id: roomId });
    if (typeof roomId === 'undefined') {
      return
    }
    setRoom(roomId)
    try {
      const response = await fetch(`${BASE_URL}get-messages?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      });
      const data = await response.json();
      if (data) {
        data.forEach(message => {
          const newMsg = {
            id: message.ID,
            createdAt: new Date(message.CreatedAt),
            text: message.MessageText,
            ai: message.UserID === "1" ? true : false,
            selected: `${selected}`
          }
          addMessage(newMsg)
        });
      }
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sends our prompt to our API and get response to our request from openai.
   *
   * @param {Event} e - The submit event of the form.
   */
  const sendMessage = async (e) => {
    e.preventDefault()

    const newMsg = formValue
    const aiModel = selected

    const BASE_URL = process.env.REACT_APP_BASE_URL
    const PATH = aiModel === options[0] ? 'davinci' : 'dalle'
    const POST_URL = BASE_URL + PATH

    setThinking(true)
    setFormValue('')
    updateMessage(newMsg, false, aiModel)

    const response = await fetch(POST_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: newMsg,
        user: user,
        room: room
      })
    })

    const data = await response.json()
    setRoom(data.room)

    if (response.ok) {
      // The request was successful
      data.bot && updateMessage(data.bot, true, aiModel)
    } else if (response.status === 429) {
      setThinking(false)
    } else {
      // The request failed
      handleShowNotification(`openAI is returning an error: ${response.status + " " + response.statusText} please try again later`, 'red')
      console.log(`Request failed with status ${response.statusText}`)
      setThinking(false)
    }

    setThinking(false)
  }

  const handleChange = e => {
    setFormValue(e.target.value)
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(e);
    }
  }

  const handleKeyUp = (e) => {
    let minus = formValue.includes("\n") || formValue.length > 86 ? 0 : 24;
    inputRef.current.style.height = "auto";
    inputRef.current.style.height = `${inputRef.current.scrollHeight-minus}px`;
  }

  const handleShowNotification = (message, type) => {
    setShowNotification(true);
    setNotificationMessage(message);
    setNotificationType(type);

    setTimeout(() => {
      setShowNotification(false);
      setNotificationMessage('');
      setNotificationType('');
    }, 3000);
  };

  /**
   * Scrolls the chat area to the bottom when the messages array is updated.
   */
  useEffect(() => {
    scrollToBottom()
  }, [messages, thinking])

  /**
   * Focuses the TextArea input to when the component is first rendered.
   */
  useEffect(() => {
    inputRef.current.focus()
  })

  useEffect(() => {
    if(isFirstRender){
      GetUserMessages();
      setIsFirstRender(false);
    }
  }, [isFirstRender, GetUserMessages]);

  return (
    <div className="chatview">
      <div>
      {showNotification && (
        <Notification message={notificationMessage} type={notificationType} />
      )}
    </div>
      <main className='chatview__chatarea'>

        {messages.map((message, index) => (
          <ChatMessage key={index} message={{ ...message, picUrl }} />
        ))}

        {thinking && <Thinking />}

        <span ref={messagesEndRef}></span>
      </main>
      <form className='form' onSubmit={sendMessage}>
        <select value={selected} onChange={(e) => setSelected(e.target.value)} className="dropdown" >
          <option>{options[0]}</option>
          <option>{options[1]}</option>
        </select>
        <div className='chatview__container'>
          <textarea
            ref={inputRef}
            className='chatview__textarea-message'
            value={formValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
          />
          <button type="submit" className='chatview__btn-send' disabled={!formValue}><MdSend /></button>
        </div>
      </form>
      <div className="text-center text-xs text-black/50 dark:text-white/50 px-4 pb-3">
        Free Research Preview.
        This is a modified version
        by <a target="_blank" rel="noreferrer" href="https://github.com/alorse">Alorse</a> (GPT 3.5 turbo).
      </div>
    </div>
  )
}

export default ChatView