import React from 'react'
import { AiOutlineRobot } from 'react-icons/ai'
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
      <div className='message__wrapper'>
        {
          selected === 'DALL·E' && ai ?
              <Image url={text} />
            :
            <>
              {
                ai ? 
                  <ReactMarkdown className={`message__markdown text-left`}
                      children={text}
                      remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
                      components={{
                        code: CodeBlock,
                      }} />
                  :
                  <div className="message__markdown text-right">
                    {text.split('\n').map((line, index) => (
                      <React.Fragment key={index}>
                        <span>{line}</span>
                        <br/> 
                      </React.Fragment>
                    ))}
                  </div>
              }
            </>
        }
        <div className={`${ai ? 'text-left' : 'text-right'} message__createdAt`}>{moment(createdAt).calendar()}</div>
        </div>

        <div className="message__pic">
          {
            ai ? <AiOutlineRobot /> :
              <img className='cover w-10 h-10 rounded-full' loading='lazy' src={picUrl} alt='profile pic' />
          }
        </div>
      </div>
    </div>
  )
}

export default ChatMessage