import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useState } from 'react';
import { MdCheck, MdContentCopy } from 'react-icons/md';

const CodeBlock = ({ node, inline, className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || 'language-js');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return !inline && match ? (
    <>
      <div className="mt-6 flex items-center relative text-gray-200 bg-gray-800 px-4 py-2 text-xs font-sans rounded-t-lg">
        <span>{match[1]}</span>
        <CopyToClipboard text={children} onCopy={handleCopy}>
          <button className="flex ml-auto gap-2">
            {copied ? (
              <>
                <MdCheck /> Copied!
              </>
            ) : (
              <>
                <MdContentCopy /> Copy code
              </>
            )}
          </button>
        </CopyToClipboard>
      </div>
      <SyntaxHighlighter
        children={String(children).replace(/\n$/, '')}
        style={vscDarkPlus}
        language={match[1]}
        PreTag="div"
        {...props}
      />
    </>
  ) : (<code className={className} {...props}>{children} </code>);
};

export default CodeBlock;
