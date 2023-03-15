import React from 'react'
import { AiOutlineRobot } from 'react-icons/ai'

const Thinking = () => {
  return (
    <div className='message-w'>
      <div className='message__wrapper flex'>
        <div className="message__pic">
          <AiOutlineRobot />
        </div>
        <div className='text-left message__createdAt'>
          <div className="message__thinking">
            Thinking...
          </div>
        </div>
      </div>
    </div>
  )
}

export default Thinking