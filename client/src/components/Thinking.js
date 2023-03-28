import React from 'react'
import bot from '../assets/logo.ico'

const Thinking = () => {
  return (
    <div className='message-w'>
      <div className='message__wrapper flex'>
        <div className="message__pic">
          <img className='w-8 h-8' src={bot} alt="GPT" />
        </div>
        <div className='loader_cointainer'>
          <div className="loader">
            <div className="inner one"></div>
            <div className="inner two"></div>
            <div className="inner three"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Thinking