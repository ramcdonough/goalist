import '../../styles/tiptapeditor.scss'

import { Link } from '@tiptap/extension-link';
import { Color } from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import { EditorProvider, useCurrentEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { ChevronLeftIcon } from 'lucide-react'
import React, { useState } from 'react'

const MenuBar = () => {
  const { editor } = useCurrentEditor()
  const [showMore, setShowMore] = useState(false)
  const [showColorOptions, setShowColorOptions] = useState(false)
  const [color, setColor] = useState('black')
  if (!editor) {
    return null
  }

  const toggleShowMore = () => {
    setShowMore(!showMore)
  }

  const toggleColorOptions = () => {
    setShowColorOptions(!showColorOptions)
  }

  const handleColorChange = (color: string) => {
    editor.chain().focus().setColor(color).run()
    setColor(color)
    setShowColorOptions(false)
  }

  return (
    <div className="control-group">
      
      <div className="button-group flex space-x-2 md:space-x-4">
        <button type="button" className={`font-semibold bg-gray-200 p-2 rounded text-${color}-700`} onClick={toggleColorOptions}>
          Color
        </button>
        {showColorOptions && (
          <div className="absolute bg-white border border-gray-300 rounded shadow-lg mt-1 z-10">
            <div className="flex flex-col">
              <button type="button" onClick={() => handleColorChange('red')} className="p-2 text-red-700 hover:bg-gray-100">Red</button>
              <button type="button" onClick={() => handleColorChange('green')} className="p-2 text-green-700 hover:bg-gray-100">Green</button>
              <button type="button" onClick={() => handleColorChange('blue')} className="p-2 text-blue-700 hover:bg-gray-100">Blue</button>
              <button type="button" onClick={() => handleColorChange('black')} className="p-2 text-black hover:bg-gray-100">Black</button>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={
            !editor.can()
              .chain()
              .focus()
              .toggleBold()
              .run()
          }
          className={editor.isActive('bold') ? 'is-active' : ''}
        >
          Bold
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={
            !editor.can()
              .chain()
              .focus()
              .toggleItalic()
              .run()
          }
          className={editor.isActive('italic') ? 'is-active' : ''}
        >
          Italic
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={
            !editor.can()
              .chain()
              .focus()
              .toggleStrike()
              .run()
          }
          className={editor.isActive('strike') ? 'is-active' : ''}
        >
          Strike
        </button>
        <button
            type="button"
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={`${editor.isActive('paragraph') ? 'is-active' : ''} ${showMore ? '' : 'hidden'} md:block`}
          >
            Paragraph
        </button>
        <button
          type="button"
          onClick={toggleShowMore}
          className={`ellipsis-button md:hidden ${showMore ? 'hidden' : ''}`}
        >
          ...
        </button>
        <div className={`${showMore ? '' : 'hidden'} md:block space-x-1 md:space-x-2`}>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
          >
            H3
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
            className={editor.isActive('heading', { level: 4 }) ? 'is-active' : ''}
          >
            H4
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
            className={editor.isActive('heading', { level: 5 }) ? 'is-active' : ''}
          >
            H5
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
            className={editor.isActive('heading', { level: 6 }) ? 'is-active' : ''}
          >
            H6
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'is-active' : ''}
          >
            Bullet list
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'is-active' : ''}
          >
            Ordered list
          </button>
          {/* <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={editor.isActive('codeBlock') ? 'is-active' : ''}
          >
            Code block
          </button> */}
          {/* <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive('blockquote') ? 'is-active' : ''}
          >
            Blockquote
          </button> */}
          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}>
            Horizontal rule
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            disabled={
            !editor.can()
              .chain()
              .focus()
              .toggleCode()
              .run()
            }
            className={editor.isActive('code') ? 'is-active' : ''}
          >
            Code
          </button>
          {/* <button
            type="button"
            onClick={() => editor.chain().focus().setHardBreak().run()}>
            Hard break
          </button> */}
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={
              !editor.can()
                .chain()
                .focus()
                .undo()
                .run()
            }
          >
            Undo
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={
              !editor.can()
                .chain()
                .focus()
                .redo()
                .run()
            }
          >
            Redo
          </button>
          <button
            type="button"
            onClick={toggleShowMore}
            className={`ellipsis-button md:hidden ${showMore ? '' : 'hidden'} justify-center items-center`}
          >
            {'<'}
          </button>
        </div>
      </div>
    </div>
  )
}

const extensions = [
  Color,
  TextStyle,
  Link,
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: false,
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false,
    },
    listItem: {
      HTMLAttributes: {
        class: 'list-item',
      },
    },
  }),
]

interface TextEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  height?: string;
  width?: number;
}

const TextEditor: React.FC<TextEditorProps> = ({ initialContent = '', onChange, height = 200, width = '100%' }) => {
  const handleUpdate = ({ editor }: { editor: any }) => {
    if (onChange) {
      onChange(editor.getHTML());
    }
  };

  return (
    <EditorProvider
      slotBefore={<MenuBar />}
      extensions={extensions}
      content={initialContent}
      onUpdate={handleUpdate}
      editorProps={{
        attributes: {
          class: `prose dark:prose-invert p-4`
        }
      }}
    >
    </EditorProvider>
  )
}

export default TextEditor