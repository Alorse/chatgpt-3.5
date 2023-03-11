import React from 'react'
import { MdComputer } from 'react-icons/md'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import moment from 'moment'
import Image from './Image'
import CodeBlock from './CodeBlock';

/**
 * A chat message component that displays a message with a timestamp and an icon.
 *
 * @param {Object} props - The properties for the component.
 */
const ChatMessage = (props) => {
  const { id, createdAt, text, ai = false, selected, picUrl } = props.message

  return (
    <div key={id} className={`${ai && 'flex-row-reverse'} message`}>
      <div className={`${ai && 'flex-row-reverse'} message-w`}>
        {
          selected === 'DALL·E' && ai ?
            <Image url={text} />
            :
            <div className='message__wrapper'>
              <ReactMarkdown className={`message__markdown ${ai ? 'text-left' : 'text-right'}`}
                children={text}
                remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
                components={{
                  code: CodeBlock,
                }} />
              <div className={`${ai ? 'text-left' : 'text-right'} message__createdAt`}>{moment(createdAt).calendar()}</div>
            </div>
        }


        <div className="message__pic">
          {
            ai ? <MdComputer /> :
              <img className='cover w-10 h-10 rounded-full' loading='lazy' src={picUrl} alt='profile pic' />
          }
        </div>
      </div>
    </div>
  )
}

export default ChatMessage