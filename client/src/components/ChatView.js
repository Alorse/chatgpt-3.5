import React, { useState, useRef, useEffect, useContext, useCallback } from 'react'
import ChatMessage from './ChatMessage'
import { ChatContext } from '../context/chatContext'
import { auth } from '../firebase'
import Thinking from './Thinking'
import { MdSend } from 'react-icons/md'
import { BsArrowDownCircle } from 'react-icons/bs'
import Notification from './Notification';
import { useLocation } from "react-router-dom";

/**
 * A chat view component that displays a list of messages and a form for sending new messages.
 */
const ChatView = () => {
  const messagesEndRef = useRef()
  const inputRef = useRef()
  const fValueRef = useRef('')
  const [thinking, setThinking] = useState(false)
  const [aiModel, setAiModel] = useState('davinci')
  const [room, setRoom] = useState(null)
  const [messages, setMessages, ] = useContext(ChatContext)
  const user = auth.currentUser.uid
  const picUrl = auth.currentUser.photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'
  const [notification, setNotification] = useState({show: false, message: ''});
  const location = useLocation();
  const roomId = location.pathname.split("/room/")[1];

  /**
   * Scrolls the chat area to the bottom.
   */
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, aiModel === 'davinci' ? 0 : 500) // When it's dall-e it needs more time to render
  }, [])

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

    setMessages(newMsg)
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
            selected: `${aiModel}`
          }
          setMessages(newMsg)
        });
      }
    } catch (error) {
      console.log(error)
    }
  }, []);

  /**
   * Sends our prompt to our API and get response to our request from openai.
   *
   * @param {Event} e - The submit event of the form.
   */
  const sendMessage = async (e) => {
    e.preventDefault()

    let newMsg = fValueRef.current
    if(newMsg.trim().length === 0){
      return
    }

    if (newMsg.startsWith('/dalle')) {
      newMsg = newMsg.replace('/dalle', '').trim()
    }

    const BASE_URL = process.env.REACT_APP_BASE_URL
    const PATH = aiModel === 'davinci' ? 'davinci' : 'dalle'
    const POST_URL = BASE_URL + PATH

    setThinking(true)
    document.querySelector('.chatview__textarea-message').value = '';
    document.querySelector('.chatview__btn-send').setAttribute('disabled', true);
    updateMessage(newMsg, false, aiModel)

    try {
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
        data.bot && updateMessage(data.bot, true, aiModel)
        setNotification({show: false});
      } else if (response.status === 429) {
        setThinking(false)
      } else {
        handleShowNotification(`openAI is returning an error: ${response.status + " " + response.statusText} please try again later`)
        console.log(`Request failed with status ${response.statusText}`)
        setThinking(false)
      }
    } catch (error) {
      handleShowNotification(`The server is not responding, try again later.`)
      console.log(error)
    }
    setThinking(false)
  }

  const handleChange = e => {
    fValueRef.current = e.target.value
    if (fValueRef.current.trim().length) {
      document.querySelector('.chatview__btn-send').removeAttribute('disabled');
    } else {
      document.querySelector('.chatview__btn-send').setAttribute('disabled', true);
    }

    if (fValueRef.current.startsWith('/dalle')) {
      setAiModel('dalle')
    } else {
      setAiModel('davinci')
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(e);
    }
  }

  const handleKeyUp = (e) => {
    let minus = e.target.value.includes("\n") || e.target.value.length > 86 ? 0 : 24;
    inputRef.current.style.height = "auto";
    inputRef.current.style.height = `${inputRef.current.scrollHeight-minus}px`;
  }

  const handleShowNotification = (message) => {
    setNotification({
      show: true,
      message: message,
    });
  };

  /**
   * Scrolls the chat area to the bottom when the messages array is updated.
   */
  useEffect(() => {
    scrollToBottom()
  }, [messages, thinking, scrollToBottom])

  /**
   * Focuses the TextArea input to when the component is first rendered.
   */
  useEffect(() => {
    inputRef.current.focus()
  })

  useEffect(() => {
    GetUserMessages();
  }, [GetUserMessages]);

  return (
    <div className="chatview">
      <div>
        {notification.show && (
          <Notification message={notification.message} />
        )}
      </div>
      <main className='chatview__chatarea'>

        {messages.map((message, index) => (
          <ChatMessage key={index} message={{ ...message, picUrl }} />
        ))}

        {thinking && <Thinking />}

        <span ref={messagesEndRef}></span>
        <div onClick={scrollToBottom} className='go_down'>
          <BsArrowDownCircle />
        </div>
      </main>
      <form className='form' onSubmit={sendMessage}>
        <div className='chatview__container'>
          <textarea
            ref={inputRef}
            className='chatview__textarea-message'
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
          />
          <button type="submit" className='chatview__btn-send' disabled><MdSend /></button>
        </div>
      </form>
      <div className="copyright">
        Free Research Preview.
        This is a modified version
        by <a target="_blank" rel="noreferrer" href="https://github.com/alorse">Alorse</a> (GPT 3.5 turbo).
      </div>
    </div>
  )
}

export default ChatView