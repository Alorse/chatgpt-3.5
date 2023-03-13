import React, { useState, useRef, useEffect, useContext } from 'react'
import ChatMessage from './ChatMessage'
import { ChatContext } from '../context/chatContext'
import { auth } from '../firebase'
import Thinking from './Thinking'
import { MdSend } from 'react-icons/md'

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
  const [messages, addMessage, , , setLimit] = useContext(ChatContext)
  const user = auth.currentUser.uid
  const picUrl = auth.currentUser.photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'

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
        user: user
      })
    })

    const data = await response.json()
    setLimit(data.limit)

    if (response.ok) {
      // The request was successful
      data.bot && updateMessage(data.bot, true, aiModel)
    } else if (response.status === 429) {
      setThinking(false)
    } else {
      // The request failed
      window.alert(`openAI is returning an error: ${response.status + response.statusText} please try again later`)
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
  }, [])

  return (
    <div className="chatview">
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
        <textarea
          ref={inputRef}
          className='chatview__textarea-message'
          value={formValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
        />
        <button type="submit" className='chatview__btn-send' disabled={!formValue}><MdSend /></button>
      </form>
      <div className="text-center text-xs text-black/50 dark:text-white/50 md:px-4 md:pt-1 md:pb-3">
        Free Research Preview.
        This is a modified version of ChatGPT by 
        <a target="_blank" rel="noreferrer" href="https://github.com/alorse">Alorse</a> (gpt-3.5-turbo).
      </div>
    </div>
  )
}

export default ChatView