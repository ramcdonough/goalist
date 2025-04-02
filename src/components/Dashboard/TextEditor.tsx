import '../../styles/tiptapeditor.scss'

import { Link } from '@tiptap/extension-link'
import { Color } from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import { EditorProvider, useCurrentEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Extension } from '@tiptap/core'
import React, { useState, useRef, useEffect } from 'react'

// Custom extension for keyboard shortcuts
const CustomKeyboardShortcuts = Extension.create({
  name: 'customKeyboardShortcuts',
  
  addKeyboardShortcuts() {
    return {
      // Handle Tab key for indenting lists
      Tab: ({ editor }) => {
        if (editor.isActive('listItem')) {
          return editor.commands.sinkListItem('listItem')
        }
        return false
      },
      
      // Handle Shift+Tab for outdenting lists
      'Shift-Tab': ({ editor }) => {
        if (editor.isActive('listItem')) {
          return editor.commands.liftListItem('listItem')
        }
        return false
      },
      
      // Add keyboard shortcut for links (Ctrl+K or Cmd+K)
      'Mod-k': ({ editor }) => {
        // Get the current selection text
        const selectedText = editor.state.doc.textBetween(
          editor.state.selection.from,
          editor.state.selection.to,
          ' '
        )
        
        // If there's a link already, unset it
        if (editor.isActive('link')) {
          editor.commands.unsetLink()
          return true
        }
        
        // If there's selected text, prompt for URL
        if (selectedText) {
          const url = prompt('Enter URL', 'https://')
          
          // If URL is provided, set the link
          if (url) {
            editor
              .chain()
              .focus()
              .setLink({ href: url, target: '_blank' })
              .run()
            return true
          }
        } else {
          // If no text is selected, prompt for both text and URL
          const text = prompt('Enter link text')
          
          if (text) {
            const url = prompt('Enter URL', 'https://')
            
            if (url) {
              editor
                .chain()
                .focus()
                .insertContent({
                  type: 'text',
                  marks: [
                    {
                      type: 'link',
                      attrs: {
                        href: url,
                        target: '_blank'
                      }
                    }
                  ],
                  text: text
                })
                .run()
              return true
            }
          }
        }
        
        return false
      }
    }
  },
})

const MenuBar = () => {
  const { editor } = useCurrentEditor()
  const [showMore, setShowMore] = useState(false)
  const [showColorOptions, setShowColorOptions] = useState(false)
  const [color, setColor] = useState('black')
  const [linkUrl, setLinkUrl] = useState('')
  const [showLinkInput, setShowLinkInput] = useState(false)
  
  // Refs for click outside detection
  const colorPickerRef = useRef<HTMLDivElement>(null)
  const colorButtonRef = useRef<HTMLButtonElement>(null)
  const linkInputRef = useRef<HTMLDivElement>(null)
  const linkButtonRef = useRef<HTMLButtonElement>(null)

  // Handle clicks outside of dropdowns
  useEffect(() => {
    if (!editor) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      // Close color picker if clicked outside
      if (showColorOptions && 
          colorPickerRef.current && 
          !colorPickerRef.current.contains(event.target as Node) &&
          colorButtonRef.current &&
          !colorButtonRef.current.contains(event.target as Node)) {
        setShowColorOptions(false)
      }
      
      // Close link input if clicked outside
      if (showLinkInput && 
          linkInputRef.current && 
          !linkInputRef.current.contains(event.target as Node) &&
          linkButtonRef.current &&
          !linkButtonRef.current.contains(event.target as Node)) {
        setShowLinkInput(false)
      }
    }
    
    // Add event listener
    document.addEventListener('mousedown', handleClickOutside)
    
    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showColorOptions, showLinkInput, editor])

  if (!editor) {
    return null
  }

  const toggleShowMore = () => {
    setShowMore(!showMore)
  }

  const toggleColorOptions = () => {
    // Close link input if it's open
    if (showLinkInput) {
      setShowLinkInput(false)
    }
    setShowColorOptions(!showColorOptions)
  }

  const handleColorChange = (color: string) => {
    editor.chain().focus().setColor(color).run()
    setColor(color)
    setShowColorOptions(false)
  }

  const toggleLinkInput = () => {
    // Close color options if they're open
    if (showColorOptions) {
      setShowColorOptions(false)
    }
    
    // If we're showing the input, check if there's a link selected
    if (!showLinkInput) {
      const linkMark = editor.getAttributes('link')
      if (linkMark.href) {
        setLinkUrl(linkMark.href)
      } else {
        setLinkUrl('')
      }
    }
    setShowLinkInput(!showLinkInput)
  }

  const setLink = () => {
    // If no URL is entered, remove the link
    if (!linkUrl) {
      editor.chain().focus().unsetLink().run()
      setShowLinkInput(false)
      return
    }

    // Check if the URL has a protocol, if not add https://
    let url = linkUrl
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url
    }

    // Set the link
    editor.chain().focus().setLink({ href: url, target: '_blank' }).run()
    setShowLinkInput(false)
  }

  const removeLink = () => {
    editor.chain().focus().unsetLink().run()
    setLinkUrl('')
    setShowLinkInput(false)
  }

  const colors = [
    { name: 'Black', value: '#000000' },
    { name: 'Gray', value: '#6B7280' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Orange', value: '#F97316' },
    { name: 'Yellow', value: '#F59E0B' },
    { name: 'Green', value: '#22C55E' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Purple', value: '#A855F7' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Teal', value: '#14B8A6' },
    { name: 'Indigo', value: '#6366F1' },
    { name: 'Amber', value: '#F59E0B' },
  ]

  return (
    <div className="control-group">
      <div className="editor-toolbar">
        {/* Text formatting group */}
        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={`font-bold toolbar-button ${editor.isActive('bold') ? 'is-active' : ''}`}
            title="Bold"
          >
            B <span className="mobile-hidden">Bold</span>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={`font-italic toolbar-button ${editor.isActive('italic') ? 'is-active' : ''}`}
            title="Italic"
          >
            I <span className="mobile-hidden">Italic</span>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            className={`font-normal line-through toolbar-button ${editor.isActive('strike') ? 'is-active' : ''}`}
            title="Strikethrough"
          >
            S <span className="mobile-hidden">Strike</span>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            disabled={!editor.can().chain().focus().toggleCode().run()}
            className={`toolbar-button ${editor.isActive('code') ? 'is-active' : ''}`}
            title="Code"
          >
            {'<>'} <span className="mobile-hidden">Code</span>
          </button>
          <button
            ref={linkButtonRef}
            type="button"
            onClick={toggleLinkInput}
            className={`toolbar-button ${editor.isActive('link') ? 'is-active' : ''}`}
            title="Link"
          >
            🔗 <span className="mobile-hidden">Link</span>
          </button>
          {showLinkInput && (
            <div ref={linkInputRef} className="link-input-container absolute z-20 mt-10 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="input input-sm input-bordered w-full max-w-xs bg-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      setLink()
                    }
                  }}
                  autoFocus
                />
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={setLink}
                  className="btn btn-sm btn-primary"
                >
                  Save
                </button>
                {editor.isActive('link') && (
                  <button
                    type="button"
                    onClick={removeLink}
                    className="btn btn-sm btn-error"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* List formatting group */}
        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`toolbar-button ${editor.isActive('bulletList') ? 'is-active' : ''}`}
            title="Bullet List"
          >
            • <span className="mobile-hidden">Bullet List</span>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`toolbar-button ${editor.isActive('orderedList') ? 'is-active' : ''}`}
            title="Numbered List"
          >
            1. <span className="mobile-hidden">Numbered List</span>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
            disabled={!editor.can().chain().focus().sinkListItem('listItem').run()}
            className="toolbar-button"
            title="Indent (Tab)"
          >
            → <span className="mobile-hidden">Indent</span>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().liftListItem('listItem').run()}
            disabled={!editor.can().chain().focus().liftListItem('listItem').run()}
            className="toolbar-button"
            title="Outdent (Shift+Tab)"
          >
            ← <span className="mobile-hidden">Outdent</span>
          </button>
        </div>

        {/* Heading group */}
        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={`toolbar-button ${editor.isActive('paragraph') ? 'is-active' : ''}`}
            title="Paragraph"
          >
            ¶ <span className="mobile-hidden">Paragraph</span>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`toolbar-button ${editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}`}
            title="Heading 1"
          >
            H1 <span className="mobile-hidden">Heading 1</span>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`toolbar-button ${editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}`}
            title="Heading 2"
          >
            H2 <span className="mobile-hidden">Heading 2</span>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`toolbar-button ${editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}`}
            title="Heading 3"
          >
            H3 <span className="mobile-hidden">Heading 3</span>
          </button>
        </div>

        {/* Color group */}
        <div className="toolbar-group">
          <div className="relative">
            <button
              ref={colorButtonRef}
              type="button"
              onClick={toggleColorOptions}
              className="toolbar-button color-button"
              title="Text Color"
            >
              <div
                className="color-indicator"
                style={{ backgroundColor: color }}
              />
              <span className="mobile-hidden">Color</span>
            </button>
            
            {showColorOptions && (
              <div ref={colorPickerRef} className="color-picker">
                {colors.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => handleColorChange(c.value)}
                    className="color-option"
                    title={c.name}
                  >
                    <div
                      className="color-dot"
                      style={{ backgroundColor: c.value }}
                    />
                    <span className="color-name">{c.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* History group */}
        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            className="toolbar-button"
            title="Undo"
          >
            ↺ <span className="mobile-hidden">Undo</span>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            className="toolbar-button"
            title="Redo"
          >
            ↻ <span className="mobile-hidden">Redo</span>
          </button>
        </div>
      </div>
    </div>
  )
}

const extensions = [
  Color.configure({ types: [TextStyle.name] }),
  TextStyle,
  Link.configure({
    openOnClick: true,
    linkOnPaste: true,
    HTMLAttributes: {
      target: '_blank',
      rel: 'noopener noreferrer',
      class: 'text-blue-500 underline hover:text-blue-700'
    },
  }),
  CustomKeyboardShortcuts,
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: true,
      HTMLAttributes: {
        class: 'list-disc list-outside',
      },
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: true,
      HTMLAttributes: {
        class: 'list-decimal list-outside',
      },
    },
    listItem: {
      HTMLAttributes: {
        class: 'list-item',
      },
    },
  }),
]

interface TextEditorProps {
  initialContent?: string
  onChange?: (content: string) => void
  height?: string
  width?: string | number
  className?: string
  autoFocus?: boolean
}

const TextEditor: React.FC<TextEditorProps> = ({ 
  initialContent = '', 
  onChange, 
  height = '200px',
  width = '100%',
  className = '',
  autoFocus = false
}) => {
  const handleUpdate = ({ editor }: { editor: any }) => {
    if (onChange) {
      onChange(editor.getHTML())
    }
  }

  // Focus the editor when it's mounted if autoFocus is true
  const onEditorReady = ({ editor }: { editor: any }) => {
    if (autoFocus && editor) {
      setTimeout(() => {
        editor.commands.focus('end')
      }, 0)
    }
  }

  return (
    <div className={`text-editor-container ${className}`} style={{ height: height }}>
      <EditorProvider
        slotBefore={<MenuBar />}
        extensions={extensions}
        content={initialContent}
        onUpdate={handleUpdate}
        onTransaction={onEditorReady}
        editorProps={{
          attributes: {
            class: `prose dark:prose-invert p-4 rounded-b-lg bg-surface-dark/10 dark:bg-surface-light/10`,
            style: `min-height: 600px; width: ${width}`
          }
        }}
      >
      </EditorProvider>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-2 hidden md:block">
        <span>Tips: Use <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">Tab</kbd> and <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">Shift+Tab</kbd> to indent and outdent lists. Press <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">Ctrl+K</kbd> to add a link.</span>
      </div>
    </div>
  )
}

export default TextEditor