'use client'

import { Text, UserCheck, BookOpen, X, Check, Pencil, Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Code, Link, Image, Quote, Strikethrough, Highlighter, Wand2, RotateCcw, Lock, AlertCircle, ShieldCheck, GraduationCap } from 'lucide-react'
import { CollapsibleMessage } from './collapsible-message'
import { DefaultSkeleton } from './default-skeleton'
import { ExportOptions } from './export-options'
import { BotMessage } from './message'
import { MessageActions } from './message-actions'
import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { Button } from './ui/button'
import Textarea from 'react-textarea-autosize'
import { SummarizationPopup } from './summarization-popup'
import { useChat } from 'ai/react'
import { CHAT_ID } from '@/lib/constants'
import { createEditor, Descendant, Editor, Element as SlateElement, Text as SlateText, BaseEditor, Transforms, Range } from 'slate'
import { Slate, Editable, withReact, ReactEditor } from 'slate-react'
import { withHistory, HistoryEditor } from 'slate-history'
import { Chart } from './chart'
import { DataVisualization } from './data-visualization'
import { saveChat } from '@/lib/actions/chat'
import { useUser, SignInButton } from '@clerk/nextjs'
import { toast } from 'sonner'
import { LoginModal } from './login-modal'
import ReactMarkdown from 'react-markdown'

// Add custom CSS for the floating menu and buttons
const floatingMenuStyles = `
  .instant-appear {
    animation: menuAppear 0.15s ease-out;
  }

  .humanize-btn:hover .w-5,
  .rewrite-btn:hover .w-5 {
    transform: scale(1.1);
    transition: transform 0.2s ease;
  }

  .humanize-btn:hover {
    background-color: rgba(59, 130, 246, 0.1);
  }

  .rewrite-btn:hover {
    background-color: rgba(147, 51, 234, 0.1);
  }

  .dark .humanize-btn:hover {
    background-color: rgba(59, 130, 246, 0.15);
  }

  .dark .rewrite-btn:hover {
    background-color: rgba(147, 51, 234, 0.15);
  }
  
  /* Improved tap target CSS */
  button, .btn, [role="button"] {
    position: relative;
    touch-action: manipulation;
  }
  
  button:after, .btn:after, [role="button"]:after {
    content: '';
    position: absolute;
    top: -8px;
    right: -8px;
    bottom: -8px;
    left: -12px;
    z-index: -1;
  }
  
  @media (max-width: 768px) {
    /* Ensure all content containers are mobile responsive */
    .answer-section-container {
      max-width: 100vw;
      overflow-x: hidden;
      padding: 0 0.5rem;
    }
    
    .answer-section-container * {
      max-width: 100%;
      overflow-wrap: break-word;
      word-wrap: break-word;
    }
    button:after, .btn:after, [role="button"]:after {
      top: -12px;
      right: -12px;
      bottom: -12px;
      left: -12px;
    }
  }

  @keyframes menuAppear {
    from {
      opacity: 0;
      transform: translateY(10px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(37, 99, 235, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(37, 99, 235, 0);
    }
  }
  
  @keyframes pulseAttentionLeft {
    0% {
      transform: translateX(0) translateY(-50%);
    }
    50% {
      transform: translateX(4px) translateY(-50%);
    }
    100% {
      transform: translateX(0) translateY(-50%);
    }
  }
  
  @keyframes glowEffect {
    0% {
      box-shadow: 0 0 5px rgba(37, 99, 235, 0.5);
    }
    50% {
      box-shadow: 0 0 15px rgba(37, 99, 235, 0.7);
    }
    100% {
      box-shadow: 0 0 5px rgba(37, 99, 235, 0.5);
    }
  }
  
  .permanent-btn-active-left {
    animation: pulseAttentionLeft 2s infinite;
  }
  
  .permanent-btn-container-left {
    transition: all 0.3s ease;
    z-index: 100;
    pointer-events: auto;
  }
  
  .permanent-btn-container-left:hover {
    transform: translateX(5px) translateY(-50%);
  }
  
  .permanent-btn-left {
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    border-top-right-radius: 0.5rem;
    border-bottom-right-radius: 0.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border-left: none;
    background-color: #2563eb;
    color: white;
    animation: glowEffect 2s infinite;
    padding: 0.85rem 1rem;
    cursor: pointer;
    position: relative;
    z-index: 100;
  }
  
  .permanent-btn-left:before {
    content: '';
    position: absolute;
    top: -10px;
    right: -10px;
    bottom: -10px;
    left: -10px;
    z-index: -1;
  }
  
  .permanent-btn-left:hover {
    background-color: #1d4ed8;
  }
  
  .permanent-btn-left.inactive {
    background-color: rgba(229, 231, 235, 0.9);
    color: #6b7280;
  }
  
  .permanent-btn-left.inactive:hover {
    background-color: #d1d5db;
  }
  
  .permanent-btn.rewrite.active {
    background-color: #9333ea;
  }
  
  .permanent-btn.rewrite.active:hover {
    background-color: #7e22ce;
  }

  @media (max-width: 768px) {
    @keyframes menuAppear {
      from {
        opacity: 0;
        transform: translateY(10px) scale(0.95) translateX(-50%);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1) translateX(-50%);
      }
    }
    
    .permanent-btn-container-left {
      transform: translateY(-50%);
      left: 0;
      z-index: 100;
    }
    
    .permanent-btn-container-left:hover {
      transform: translateX(5px) translateY(-50%);
    }
    
    .permanent-btn-left {
      padding: 0.9rem 1rem !important;
      width: 70px !important;
      display: flex;
      justify-content: center;
      border-radius: 0 8px 8px 0;
    }
    
    .permanent-btn-left:before {
      content: '';
      position: absolute;
      top: -15px;
      right: -15px;
      bottom: -15px;
      left: -5px;
      z-index: -1;
    }
    
    .permanent-btn-left.inactive {
      background-color: rgba(229, 231, 235, 0.95);
    }
    
    .permanent-btn-left.active {
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    }
    
    .permanent-btn-left span {
      display: none;
    }
    
    .permanent-btn-left .rounded-full {
      margin-right: 0;
      padding: 0.6rem !important;
    }
    
    .permanent-btn-left .h-6,
    .permanent-btn-left .h-7 {
      height: 1.75rem !important;
      width: 1.75rem !important;
    }
    
    /* Mobile text and content handling */
    .prose {
      max-width: 100% !important;
      overflow-x: hidden;
    }
    
    .prose p, .prose div, .prose span {
      overflow-wrap: break-word;
      word-break: break-word;
      max-width: 100%;
    }
    
    /* Mobile code blocks */
    .prose pre {
      max-width: calc(100vw - 2rem);
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-all;
    }
    
    /* Mobile tables */
    .prose table {
      display: block;
      max-width: 100%;
      overflow-x: auto;
      font-size: 0.875rem;
    }
  }

  @keyframes pulse-academic {
    0% { box-shadow: 0 0 0 0 #c4b5fd; }
    70% { box-shadow: 0 0 0 8px rgba(147, 51, 234, 0); }
    100% { box-shadow: 0 0 0 0 #c4b5fd; }
  }
  .academic-btn.animate-pulse-academic {
    animation: pulse-academic 1.2s infinite;
    border-color: #9333ea;
    color: #9333ea;
  }
`;

// Function to clean API response text, removing any unwanted prefixes or system messages
const cleanApiResponseText = (text: string) => {
  if (!text) return '';
  
  // Remove any "Sure!" prefix and similar patterns - using non-dotall flags
  const cleanText = text
    .replace(/^(Sure!|Certainly!|Here's|I've|Of course!|Alright,|Okay,|Here is).*?:/g, '')
    .replace(/^(Here's|I've created) (a|an|the) (more|better|humanized|natural|casual|improved) (version|form|revision|rewrite|text).*?:/g, '')
    .replace(/^-{3,}\s*/gm, '')
    .replace(/\s*-{3,}$/gm, '')
    .trim();
  
  return cleanText;
};

// Define custom types for our editor
type CustomElement = { 
  type: 'paragraph' | 'heading-one' | 'heading-two' | 'bulleted-list' | 'numbered-list' | 'list-item' | 'block-quote' | 'code-block' | 'link' | 'table' | 'table-row' | 'table-cell' | 'chart' | 'time-series'
  align?: 'left' | 'center' | 'right'
  url?: string
  chartData?: any
  chartType?: 'line' | 'bar' | 'pie' | 'doughnut' | 'scatter'
  timeSeriesData?: {
    title: string;
    description?: string;
    columns: {
      year: number;
      value: number;
    }[];
    displayOptions: {
      maxTableRows: number;
      chartType: 'line' | 'bar';
      yAxisLabel: string;
      formatValue?: (value: number) => string;
    };
  }
  children: (CustomText | CustomElement)[] 
}
type CustomText = { 
  text: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  highlight?: boolean
  code?: boolean
}

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor
    Element: CustomElement
    Text: CustomText
  }
}

interface AnswerSectionProps {
  content: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  chatId?: string
  messageId?: string
}

const SlateEditor = ({ content, onSave, onCancel }: { 
  content: string, 
  onSave: (content: string) => void,
  onCancel: () => void 
}) => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), [])
  const linkInputRef = useRef<HTMLInputElement>(null)
  
  const initialValue: Descendant[] = useMemo(() => [{
    type: 'paragraph',
    children: [{ text: content }],
  }], [content])

  const [value, setValue] = useState<Descendant[]>(initialValue)
  const [linkUrl, setLinkUrl] = useState('')
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [isHumanizing, setIsHumanizing] = useState(false)
  const [isRewriting, setIsRewriting] = useState(false)
  const [selectedTextToHumanize, setSelectedTextToHumanize] = useState('')
  const [isGeneratingAcademic, setIsGeneratingAcademic] = useState(false)
  const [isCheckingPlagiarism, setIsCheckingPlagiarism] = useState(false)
  const [plagiarismResult, setPlagiarismResult] = useState<string | null>(null)
  const [showPlagiarismModal, setShowPlagiarismModal] = useState(false)
  // Quiz state
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false)
  const [quizQuestions, setQuizQuestions] = useState<any[]>([])
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<string[]>([])
  const [quizScore, setQuizScore] = useState<number | null>(null)
  // Tutor state
  const [isTutorModalOpen, setIsTutorModalOpen] = useState(false);
  const [isTutorLoading, setIsTutorLoading] = useState(false);
  const [tutorQuestion, setTutorQuestion] = useState('');
  const [tutorResult, setTutorResult] = useState<string | null>(null);

  // This effect updates the editor content when the content prop changes
  useEffect(() => {
    const newValue: Descendant[] = [{
      type: 'paragraph',
      children: [{ text: content }],
    }]
    setValue(newValue)
    
    // Update the editor selection to avoid cursor jumps
    const point = { path: [0, 0], offset: 0 }
    Transforms.select(editor, {
      anchor: point,
      focus: point,
    })
  }, [content, editor])

  const handleSave = () => {
    // Convert the Slate content to plain text while preserving formatting
    const formattedContent = value
      .map(node => {
        if (SlateElement.isElement(node)) {
          // Handle different block types
          switch (node.type) {
            case 'heading-one':
              return `# ${node.children.map(child => SlateText.isText(child) ? child.text : '').join('')}\n`
            case 'heading-two':
              return `## ${node.children.map(child => SlateText.isText(child) ? child.text : '').join('')}\n`
            case 'block-quote':
              return `> ${node.children.map(child => SlateText.isText(child) ? child.text : '').join('')}\n`
            case 'bulleted-list':
              return node.children.map(child => {
                if (SlateElement.isElement(child)) {
                  return `• ${child.children.map(c => SlateText.isText(c) ? c.text : '').join('')}`
                }
                return ''
              }).join('\n') + '\n'
            case 'numbered-list':
              return node.children.map((child, index) => {
                if (SlateElement.isElement(child)) {
                  return `${index + 1}. ${child.children.map(c => SlateText.isText(c) ? c.text : '').join('')}`
                }
                return ''
              }).join('\n') + '\n'
            case 'code-block':
              return '```\n' + node.children.map(child => SlateText.isText(child) ? child.text : '').join('') + '\n```\n'
            default:
              return node.children.map(child => {
                if (SlateText.isText(child)) {
                  let text = child.text
                  if (child.bold) text = `**${text}**`
                  if (child.italic) text = `*${text}*`
                  if (child.underline) text = `__${text}__`
                  if (child.strikethrough) text = `~~${text}~~`
                  if (child.code) text = `\`${text}\``
                  return text
                }
                return ''
              }).join('') + '\n'
          }
        }
        return ''
      })
      .join('')

    // Call the onSave callback with the formatted content
    onSave(formattedContent)
  }

  const toggleFormat = (format: keyof Omit<CustomText, 'text'>) => {
    const isActive = isFormatActive(format)
    Transforms.setNodes(
      editor,
      { [format]: isActive ? null : true },
      { match: SlateText.isText, split: true }
    )
  }

  const toggleBlock = (format: CustomElement['type']) => {
    const isActive = isBlockActive(format)
    Transforms.setNodes(
      editor,
      { type: isActive ? 'paragraph' : format },
      { match: n => SlateElement.isElement(n) }
    )
  }

  const toggleAlignment = (align: 'left' | 'center' | 'right') => {
    Transforms.setNodes(
      editor,
      { align },
      { match: n => SlateElement.isElement(n) }
    )
  }

  const insertLink = () => {
    if (linkUrl) {
      const { selection } = editor
      if (selection) {
        Transforms.setNodes(
          editor,
          { type: 'link', url: linkUrl },
          { match: n => SlateElement.isElement(n) }
        )
      }
      setLinkUrl('')
      setShowLinkInput(false)
    }
  }

  const isFormatActive = (format: string) => {
    const [match] = Editor.nodes(editor, {
      match: n => SlateText.isText(n) && n[format as keyof CustomText] === true,
      universal: true,
    })
    return !!match
  }

  const isBlockActive = (format: string) => {
    const [match] = Editor.nodes(editor, {
      match: n => SlateElement.isElement(n) && n.type === format,
    })
    return !!match
  }

  const isAlignmentActive = (align: string) => {
    const [match] = Editor.nodes(editor, {
      match: n => SlateElement.isElement(n) && n.align === align,
    })
    return !!match
  }

  const renderElement = useCallback((props: any) => {
    const { attributes, children, element } = props
    const style = { textAlign: element.align }

    switch (element.type) {
      case 'heading-one':
        return <h1 {...attributes} style={style}>{children}</h1>
      case 'heading-two':
        return <h2 {...attributes} style={style}>{children}</h2>
      case 'block-quote':
        return <blockquote {...attributes} style={style}>{children}</blockquote>
      case 'bulleted-list':
        return <ul {...attributes}>{children}</ul>
      case 'numbered-list':
        return <ol {...attributes}>{children}</ol>
      case 'list-item':
        return <li {...attributes}>{children}</li>
      case 'code-block':
        return (
          <pre {...attributes} style={{ ...style, backgroundColor: '#f5f5f5', padding: '1rem', borderRadius: '0.25rem' }}>
            <code>{children}</code>
          </pre>
        )
      case 'link':
        return (
          <a {...attributes} href={element.url} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        )
      case 'table':
        return (
          <div className="overflow-x-auto my-4">
            <table {...attributes} className="min-w-full border-collapse border border-zinc-200 dark:border-zinc-800">
              {children}
            </table>
          </div>
        )
      case 'table-row':
        return <tr {...attributes} className="border-b border-zinc-200 dark:border-zinc-800">{children}</tr>
      case 'table-cell':
        return <td {...attributes} className="border border-zinc-200 dark:border-zinc-800 p-2">{children}</td>
      case 'chart':
        return (
          <div {...attributes} className="my-4">
            <Chart 
              type={element.chartType || 'line'} 
              data={element.chartData || {}} 
              className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800"
            />
          </div>
        )
      case 'time-series':
        return (
          <div {...attributes} className="my-4">
            <DataVisualization 
              data={element.timeSeriesData || {
                title: '',
                columns: [],
                displayOptions: {
                  maxTableRows: 5,
                  chartType: 'line',
                  yAxisLabel: 'Value'
                }
              }}
              className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800"
            />
            {children}
          </div>
        )
      default:
        return <p {...attributes} style={style}>{children}</p>
    }
  }, [])

  const renderLeaf = useCallback((props: any) => {
    const { attributes, children, leaf } = props
    let element = <span {...attributes}>{children}</span>

    if (leaf.bold) {
      element = <strong>{element}</strong>
    }
    if (leaf.italic) {
      element = <em>{element}</em>
    }
    if (leaf.underline) {
      element = <u>{element}</u>
    }
    if (leaf.strikethrough) {
      element = <s>{element}</s>
    }
    if (leaf.highlight) {
      element = <mark>{element}</mark>
    }
    if (leaf.code) {
      element = <code>{element}</code>
    }

    return element
  }, [])

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'b':
          event.preventDefault()
          toggleFormat('bold')
          break
        case 'i':
          event.preventDefault()
          toggleFormat('italic')
          break
        case 'u':
          event.preventDefault()
          toggleFormat('underline')
          break
        case '`':
          event.preventDefault()
          toggleFormat('code')
          break
        case '1':
          event.preventDefault()
          toggleBlock('heading-one')
          break
        case '2':
          event.preventDefault()
          toggleBlock('heading-two')
          break
        case 'l':
          event.preventDefault()
          setShowLinkInput(true)
          break
      }
    }
  }

  // Function to humanize selected text in the editor
  const humanizeSelectedText = async () => {
    const { selection } = editor
    if (!selection || Editor.string(editor, selection).length === 0) {
      // No text selected
      return
    }
    
    // Get selected text
    const selectedText = Editor.string(editor, selection)
    if (!selectedText.trim()) return
    
    setIsHumanizing(true)
    setSelectedTextToHumanize(selectedText)
    
    try {
      // Call the humanize API with word-level humanization enabled
      const response = await fetch('/api/humanize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: selectedText, type: 'summary', useWordLevel: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to humanize text');
      }

      const data = await response.json();
      
      // Log the response to help debug
      console.log('Humanize API response (editor):', data);
      
      let humanizedText = data.humanizedText || '';
      
      if (!humanizedText) {
        console.error('Humanize API did not return expected data structure');
        return;
      }
      
      // Clean up the response text to remove unwanted prefixes
      humanizedText = cleanApiResponseText(humanizedText);
      
      // Replace the selected text with humanized text
      Transforms.delete(editor, { at: selection })
      Transforms.insertText(editor, humanizedText, { at: selection.anchor })
    } catch (error) {
      console.error('Error humanizing text:', error);
    } finally {
      setIsHumanizing(false)
      setSelectedTextToHumanize('')
    }
  }

  // Function to rewrite selected text in the editor
  const rewriteSelectedText = async () => {
    const { selection } = editor
    if (!selection || Editor.string(editor, selection).length === 0) {
      // No text selected
      return
    }
    
    // Get selected text
    const selectedText = Editor.string(editor, selection)
    if (!selectedText.trim()) return
    
    setIsRewriting(true)
    
    try {
      // Call the rewrite API
      const response = await fetch('/api/rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: selectedText }),
      });

      if (!response.ok) {
        throw new Error('Failed to rewrite text');
      }

      const data = await response.json();
      
      // Log the response to help debug
      console.log('Rewrite API response (editor):', data);
      
      let rewrittenText = data.rewrittenText || '';
      
      if (!rewrittenText) {
        console.error('Rewrite API did not return expected data structure');
        return;
      }
      
      // Clean up the response text to remove unwanted prefixes
      rewrittenText = cleanApiResponseText(rewrittenText);
      
      // Replace the selected text with rewritten text
      Transforms.delete(editor, { at: selection })
      Transforms.insertText(editor, rewrittenText, { at: selection.anchor })
    } catch (error) {
      console.error('Error rewriting text:', error);
      // On error, don't change the text
    } finally {
      setIsRewriting(false)
    }
  }

  // Add the academic paper generation function here
  const generateAcademicPaperFromSelection = async () => {
    const { selection } = editor
    if (!selection || Editor.string(editor, selection).length === 0) {
      // No text selected
      return
    }
    const selectedText = Editor.string(editor, selection)
    if (!selectedText.trim()) return
    setIsGeneratingAcademic(true)
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: selectedText, tone: 'academic' }),
      })
      if (!response.ok) throw new Error('Failed to generate academic paper')
      const data = await response.json()
      let academicText = data.summary || ''
      if (!academicText) return
      academicText = cleanApiResponseText(academicText)
      Transforms.delete(editor, { at: selection })
      Transforms.insertText(editor, academicText, { at: selection.anchor })
    } catch (error) {
      console.error('Error generating academic paper:', error)
    } finally {
      setIsGeneratingAcademic(false)
    }
  }

  const handleCheckPlagiarism = async () => {
    setIsCheckingPlagiarism(true);
    setPlagiarismResult(null);
    try {
      const text = value.map(node => {
        if (SlateElement.isElement(node)) {
          return node.children.map(child => SlateText.isText(child) ? child.text : '').join('');
        }
        return '';
      }).join('\n');
      const response = await fetch('/api/plagiarism', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) throw new Error('Failed to check plagiarism');
      const data = await response.json();
      setPlagiarismResult(data.result || 'No result');
      setShowPlagiarismModal(true);
    } catch (error) {
      setPlagiarismResult('Error checking plagiarism.');
      setShowPlagiarismModal(true);
    } finally {
      setIsCheckingPlagiarism(false);
    }
  };

  // Quiz handler
  const handleGenerateQuiz = async () => {
    setIsGeneratingQuiz(true);
    setQuizQuestions([]);
    setCurrentQuizIndex(0);
    setUserAnswers([]);
    setQuizScore(null);
    try {
      const text = value.map(node => {
        if (SlateElement.isElement(node)) {
          return node.children.map(child => SlateText.isText(child) ? child.text : '').join('');
        }
        return '';
      }).join('\n');
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) throw new Error('Failed to generate quiz');
      const data = await response.json();
      if (data.questions && Array.isArray(data.questions)) {
        setQuizQuestions(data.questions);
        setShowQuizModal(true);
      } else {
        setQuizQuestions([]);
        setShowQuizModal(true);
      }
    } catch (error) {
      setQuizQuestions([]);
      setShowQuizModal(true);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleQuizAnswer = (answer: string) => {
    const updatedAnswers = [...userAnswers, answer];
    setUserAnswers(updatedAnswers);
    if (currentQuizIndex < quizQuestions.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
    } else {
      // Calculate score
      let score = 0;
      quizQuestions.forEach((q, i) => {
        if (updatedAnswers[i] && q.answer && updatedAnswers[i].toUpperCase() === q.answer.toUpperCase()) {
          score++;
        }
      });
      setQuizScore(score);
    }
  };

  const handleQuizRestart = () => {
    setCurrentQuizIndex(0);
    setUserAnswers([]);
    setQuizScore(null);
  };

  // Tutor handler
  const handleTutorAsk = async () => {
    setIsTutorLoading(true);
    setTutorResult(null);
    try {
      const text = value.map(node => {
        if (SlateElement.isElement(node)) {
          return node.children.map(child => SlateText.isText(child) ? child.text : '').join('');
        }
        return '';
      }).join('\n');
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, question: tutorQuestion }),
      });
      if (!response.ok) throw new Error('Failed to get tutor help');
      const data = await response.json();
      setTutorResult(data.result || 'No result');
    } catch (error) {
      setTutorResult('Error getting tutor help.');
    } finally {
      setIsTutorLoading(false);
    }
  };

  return (
    <div className="space-y-2 w-full">
      <div className="w-full min-h-[60px] p-2 rounded-md border border-input bg-background overflow-x-auto">
        <div className="flex flex-wrap gap-1 mb-2 p-1 border-b overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-700">
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 flex-shrink-0 ${isFormatActive('bold') ? 'bg-muted' : ''}`}
            onClick={() => toggleFormat('bold')}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 flex-shrink-0 ${isFormatActive('italic') ? 'bg-muted' : ''}`}
            onClick={() => toggleFormat('italic')}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 flex-shrink-0 ${isFormatActive('underline') ? 'bg-muted' : ''}`}
            onClick={() => toggleFormat('underline')}
            title="Underline (Ctrl+U)"
          >
            <Underline className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 flex-shrink-0 ${isFormatActive('strikethrough') ? 'bg-muted' : ''}`}
            onClick={() => toggleFormat('strikethrough')}
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 flex-shrink-0 ${isFormatActive('highlight') ? 'bg-muted' : ''}`}
            onClick={() => toggleFormat('highlight')}
            title="Highlight"
          >
            <Highlighter className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 flex-shrink-0 ${isFormatActive('code') ? 'bg-muted' : ''}`}
            onClick={() => toggleFormat('code')}
            title="Code (Ctrl+`)"
          >
            <Code className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1 flex-shrink-0" />
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 flex-shrink-0 ${isBlockActive('heading-one') ? 'bg-muted' : ''}`}
            onClick={() => toggleBlock('heading-one')}
            title="Heading 1 (Ctrl+1)"
          >
            H1
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 flex-shrink-0 ${isBlockActive('heading-two') ? 'bg-muted' : ''}`}
            onClick={() => toggleBlock('heading-two')}
            title="Heading 2 (Ctrl+2)"
          >
            H2
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 flex-shrink-0 ${isBlockActive('bulleted-list') ? 'bg-muted' : ''}`}
            onClick={() => toggleBlock('bulleted-list')}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 flex-shrink-0 ${isBlockActive('numbered-list') ? 'bg-muted' : ''}`}
            onClick={() => toggleBlock('numbered-list')}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 flex-shrink-0 ${isBlockActive('block-quote') ? 'bg-muted' : ''}`}
            onClick={() => toggleBlock('block-quote')}
            title="Block Quote"
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 flex-shrink-0 ${isBlockActive('code-block') ? 'bg-muted' : ''}`}
            onClick={() => toggleBlock('code-block')}
            title="Code Block"
          >
            <Code className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1 flex-shrink-0" />
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 flex-shrink-0 ${isAlignmentActive('left') ? 'bg-muted' : ''}`}
            onClick={() => toggleAlignment('left')}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 flex-shrink-0 ${isAlignmentActive('center') ? 'bg-muted' : ''}`}
            onClick={() => toggleAlignment('center')}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 flex-shrink-0 ${isAlignmentActive('right') ? 'bg-muted' : ''}`}
            onClick={() => toggleAlignment('right')}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1 flex-shrink-0" />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 flex-shrink-0"
            onClick={() => setShowLinkInput(true)}
            title="Insert Link (Ctrl+L)"
          >
            <Link className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 relative flex-shrink-0`}
            onClick={humanizeSelectedText}
            disabled={isHumanizing || isRewriting || isGeneratingAcademic}
            title="Humanize Selected Text"
          >
            <UserCheck className="h-4 w-4" />
            {isHumanizing && <span className="animate-spin absolute inset-0 flex items-center justify-center">⌛</span>}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 relative flex-shrink-0 academic-btn ${isGeneratingAcademic ? 'animate-pulse-academic' : ''}`}
            onClick={generateAcademicPaperFromSelection}
            disabled={isHumanizing || isRewriting || isGeneratingAcademic}
            title="Generate Academic Paper from Selected Text"
            style={{ borderColor: '#9333ea', color: '#9333ea', boxShadow: isGeneratingAcademic ? '0 0 0 4px #c4b5fd' : undefined }}
          >
            <BookOpen className="h-4 w-4" />
            {isGeneratingAcademic && <span className="animate-spin absolute inset-0 flex items-center justify-center">⌛</span>}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 flex-shrink-0 ${isCheckingPlagiarism ? 'opacity-60' : ''}`}
            onClick={handleCheckPlagiarism}
            title="Check Plagiarism"
            disabled={isCheckingPlagiarism}
          >
            <ShieldCheck className="h-4 w-4 text-green-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 flex-shrink-0 ${isGeneratingQuiz ? 'opacity-60' : ''}`}
            onClick={handleGenerateQuiz}
            title="Generate Quiz"
            disabled={isGeneratingQuiz}
          >
            <BookOpen className="h-4 w-4 text-blue-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 flex-shrink-0 ${isTutorLoading ? 'opacity-60' : ''}`}
            onClick={() => setIsTutorModalOpen(true)}
            title="Ask Tutor"
            disabled={isTutorLoading}
          >
            <GraduationCap className="h-4 w-4 text-emerald-600" />
          </Button>
        </div>
        {showLinkInput && (
          <div className="flex flex-wrap gap-2 mb-2">
            <input
              ref={linkInputRef}
              type="text"
              placeholder="Enter URL..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="flex-1 px-2 py-1 text-sm border rounded min-w-[150px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  insertLink()
                }
              }}
            />
            <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={insertLink}
                className="whitespace-nowrap"
            >
              Add
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowLinkInput(false)
                setLinkUrl('')
              }}
                className="whitespace-nowrap"
            >
              Cancel
            </Button>
            </div>
          </div>
        )}
        <Slate editor={editor} initialValue={initialValue} onChange={setValue}>
          <Editable
            placeholder="Enter your text..."
            className="outline-none min-h-[200px] w-full break-words whitespace-pre-wrap"
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            onKeyDown={handleKeyDown}
          />
        </Slate>
      </div>
      <div className="flex gap-2 justify-end">
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSave}
          className="h-8 w-8"
        >
          <Check className="h-4 w-4" />
        </Button>
      </div>
      {showPlagiarismModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 max-w-md w-full flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-blue-500" />
              <span className="font-semibold text-lg">Plagiarism Check Result</span>
            </div>
            <div className="text-sm text-zinc-800 dark:text-zinc-100 mb-4 text-center whitespace-pre-line">
              {plagiarismResult}
            </div>
            <Button onClick={() => setShowPlagiarismModal(false)} className="mt-2">Close</Button>
          </div>
        </div>
      )}
      {showQuizModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 max-w-md w-full flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <span className="font-semibold text-lg">Quiz</span>
            </div>
            {quizQuestions.length === 0 ? (
              <div className="text-sm text-zinc-800 dark:text-zinc-100 mb-4 text-center">No quiz generated.</div>
            ) : quizScore === null ? (
              <>
                <div className="text-base font-medium mb-4 text-center">{quizQuestions[currentQuizIndex]?.question}</div>
                <div className="flex flex-col gap-2 w-full">
                  {quizQuestions[currentQuizIndex]?.options?.map((opt: string, idx: number) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className="w-full"
                      onClick={() => handleQuizAnswer(opt[0])}
                      disabled={userAnswers.length > currentQuizIndex}
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
                <div className="mt-4 text-xs text-zinc-500">Question {currentQuizIndex + 1} of {quizQuestions.length}</div>
              </>
            ) : (
              <>
                <div className="text-lg font-semibold mb-2 text-center">Quiz Complete!</div>
                <div className="text-base mb-4 text-center">You scored {quizScore} out of {quizQuestions.length}.</div>
                <Button onClick={handleQuizRestart} className="mb-2">Retake Quiz</Button>
              </>
            )}
            <Button onClick={() => setShowQuizModal(false)} className="mt-2">Close</Button>
          </div>
        </div>
      )}
      {isTutorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-0 max-w-md w-full flex flex-col" style={{ maxHeight: '90vh' }}>
            <div className="flex items-center gap-2 px-6 pt-6 pb-2">
              <GraduationCap className="h-5 w-5 text-emerald-500" />
              <span className="font-semibold text-lg">Tutor Assistant</span>
            </div>
            <div className="flex-1 overflow-y-auto px-6" style={{ maxHeight: '50vh' }}>
              {tutorResult && (() => {
                // Split the result into explanation and follow-up questions
                const followupHeader = /Follow[- ]?up Questions?:/i;
                const parts = tutorResult.split(followupHeader);
                const explanation = parts[0]?.replace(/^Explanation:/i, '').trim();
                let followups: string[] = [];
                if (parts[1]) {
                  // Extract numbered or bulleted questions
                  followups = parts[1].split(/\n|\r/)
                    .map(line => line.trim())
                    .filter(line => line.match(/^\d+\.|[-*]/));
                  // If not found, fallback to all non-empty lines
                  if (followups.length === 0) {
                    followups = parts[1].split(/\n|\r/).map(line => line.trim()).filter(Boolean);
                  }
                }
                return (
                  <div className="text-sm text-zinc-800 dark:text-zinc-100 mb-4 text-left prose prose-sm dark:prose-invert max-w-none">
                    {explanation && <ReactMarkdown>{explanation}</ReactMarkdown>}
                    {followups.length > 0 && (
                      <div className="mt-4">
                        <div className="font-semibold mb-1">Follow-up Questions:</div>
                        <ol className="list-decimal ml-5">
                          {followups.map((q, i) => (
                            <li key={i}>{q.replace(/^\d+\.|[-*]/, '').trim()}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
            <div className="w-full px-6 pb-6 pt-2 bg-white dark:bg-zinc-900 flex flex-col gap-2 sticky bottom-0">
              <input
                type="text"
                className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-background text-sm"
                placeholder="What part don't you understand? Ask a question..."
                value={tutorQuestion}
                onChange={e => setTutorQuestion(e.target.value)}
                disabled={isTutorLoading}
                onKeyDown={e => { if (e.key === 'Enter') handleTutorAsk(); }}
              />
              <Button
                onClick={handleTutorAsk}
                disabled={isTutorLoading || !tutorQuestion.trim()}
                className="w-full"
              >
                {isTutorLoading ? 'Loading...' : 'Ask Tutor'}
              </Button>
              <Button onClick={() => { setIsTutorModalOpen(false); setTutorResult(null); setTutorQuestion(''); }} className="w-full" variant="outline">Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Update the FloatingMenu component
function FloatingMenu({ 
  position, 
  onHumanize, 
  onRewrite,
  onClose 
}: { 
  position: { x: number; y: number } | null;
  onHumanize: () => void;
  onRewrite: () => void;
  onClose: () => void;
}) {
  // Create a ref for the menu element
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Track if we're on mobile
  const [isMobile, setIsMobile] = useState(false);
  
  // State to track adjusted position
  const [adjustedPosition, setAdjustedPosition] = useState(position || { x: 0, y: 0 });
  
  // Track whether the menu is fully initialized
  const [isInitialized, setIsInitialized] = useState(false);
  
  // State to determine if menu should be positioned on right side
  const [positionRight, setPositionRight] = useState(false);
  
  // Check for mobile on component mount with debounce for performance
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Debounced resize handler
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(checkMobile, 100);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);
  
  // Mark as initialized on first render
  useEffect(() => {
    if (position) {
      // Always set to initialized when position changes to ensure menu appears
      setIsInitialized(true);
      console.log("FloatingMenu initialized with position:", position);
    }
  }, [position]);
  
  // Use effect to adjust position immediately
  useEffect(() => {
    if (!position) return;
    
    // Set initial position immediately 
    setAdjustedPosition(position);
    console.log("Setting initial position:", position);
    
    // Only do boundary checking if we have a menu ref
    if (menuRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let newX = position.x;
      let newY = position.y;
      
      // Determine whether to position on right side
      // Display on right side if in the left 60% of the screen, otherwise display on left
      setPositionRight(position.x < viewportWidth * 0.6);
      
      // Simplified adjustments for immediate display
      // Keep menu within screen bounds
      if (isMobile) {
        // Simple mobile positioning - center horizontally, position near touch
        newX = Math.min(Math.max(menuRect.width/2 + 10, newX), viewportWidth - menuRect.width/2 - 10);
        newY = Math.max(menuRect.height + 10, newY - 30);
      } else {
        // Adjust X position based on positionRight
        if (positionRight) {
          // Position to the right
          newX = Math.min(position.x + 20, viewportWidth - menuRect.width - 10);
        } else {
          // Position normally (transforms will center it)
          newX = Math.min(Math.max(menuRect.width/2 + 10, newX), viewportWidth - menuRect.width/2 - 10);
        }
        
        // Position above or below based on space
        if (position.y - menuRect.height < 10) {
          newY = position.y + 20; // Below cursor
        } else {
          newY = position.y - 10; // Above cursor (default)
        }
      }
      
      // Only update if position changed
      if (newX !== position.x || newY !== position.y) {
        console.log("Adjusting position:", { from: position, to: { x: newX, y: newY } });
      setAdjustedPosition({ x: newX, y: newY });
      }
    }
  }, [position, isMobile, positionRight]);

  // Handle keyboard navigation within the menu
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);
  
  // Handle button clicks with a small delay to ensure state is synchronized
  const handleHumanizeClick = useCallback(() => {
    // Apply a very small delay to ensure state is in sync
    requestAnimationFrame(() => {
      onHumanize();
    });
  }, [onHumanize]);
  
  const handleRewriteClick = useCallback(() => {
    // Apply a very small delay to ensure state is in sync
    requestAnimationFrame(() => {
      onRewrite();
    });
  }, [onRewrite]);

  // If no position, don't render
  if (!position) {
    return null;
  }
  
  console.log("Rendering FloatingMenu at:", adjustedPosition, "initialized:", isInitialized);

  return (
    <div 
      ref={menuRef}
      className={`fixed z-50 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-700 p-1.5 flex gap-1.5 instant-appear backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95 floating-menu-container ${
        isMobile ? 'w-[calc(100%-20px)] max-w-[400px] flex-col' : 'flex-row'
      }`}
      style={{ 
        top: `${adjustedPosition.y}px`, 
        left: `${adjustedPosition.x}px`,
        transform: isMobile 
          ? 'translate(-50%, 0)' 
          : positionRight 
            ? 'translate(10px, -50%)' // Position on right side of selection
            : 'translate(-50%, -100%)', // Original positioning
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.15)',
        opacity: isInitialized ? 1 : 0, // Start invisible until fully initialized
        pointerEvents: isInitialized ? 'auto' : 'none', // Prevent clicks until initialized
        animation: 'menuAppear 0.2s ease-out',
        touchAction: 'manipulation'
      }}
      role="dialog"
      aria-label="Text editing options"
      onKeyDown={handleKeyDown}
      tabIndex={0} /* Make the dialog focusable */
    >
      <button
        onClick={handleHumanizeClick}
        className={`humanize-btn flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all duration-150 text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30 ${
          isMobile ? 'flex-1 justify-center py-2.5' : ''
        }`}
        aria-label="Humanize selected text"
        style={{ touchAction: 'manipulation', minHeight: isMobile ? '44px' : '36px' }}
      >
        <div className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 transition-transform duration-200">
          <UserCheck className="h-3 w-3 text-blue-700 dark:text-blue-400" />
        </div>
        <span className="text-blue-700 dark:text-blue-400">Humanize</span>
      </button>
      <button
        onClick={handleRewriteClick}
        className={`rewrite-btn flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all duration-150 text-sm font-medium hover:bg-purple-50 dark:hover:bg-purple-900/30 ${
          isMobile ? 'flex-1 justify-center py-2.5' : ''
        }`}
        aria-label="Rewrite selected text"
        style={{ touchAction: 'manipulation', minHeight: isMobile ? '44px' : '36px' }}
      >
        <div className="w-5 h-5 flex items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/50 transition-transform duration-200">
          <Wand2 className="h-3 w-3 text-purple-700 dark:text-purple-400" />
        </div>
        <span className="text-purple-700 dark:text-purple-400">Rewrite</span>
      </button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className={`hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full transition-all duration-150 ${
          isMobile ? 'absolute top-1 right-1 h-7 w-7 p-0' : 'h-8 w-8 p-0 ml-0.5'
        }`}
        aria-label="Close menu"
        style={{ touchAction: 'manipulation' }}
      >
        <X className={isMobile ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      </Button>
    </div>
  );
}

// Update the HumanizeButton component with realistic progress indicator
const HumanizeButton = ({ onClick, isLoading, isActive }: { 
  onClick: () => void; 
  isLoading: boolean; 
  isActive: boolean;
}) => {
  const { user } = useUser();
  const [showLoginModal, setShowLoginModal] = useState(false);
  // Generate a random progress percentage that increments realistically
  const [progressPercent, setProgressPercent] = useState(0);
  
  useEffect(() => {
    if (isLoading) {
      let interval: NodeJS.Timeout;
      // Start with small increments that slow down as we approach 100%
      const incrementProgress = () => {
        setProgressPercent(prev => {
          if (prev < 20) return prev + Math.random() * 10;
          if (prev < 50) return prev + Math.random() * 5;
          if (prev < 80) return prev + Math.random() * 2;
          if (prev < 90) return prev + Math.random() * 0.5;
          return prev;  // Once we're at 90%, wait for actual completion
        });
      };
      
      interval = setInterval(incrementProgress, 300);
      
      return () => {
        clearInterval(interval);
        // Reset when loading is complete
        setProgressPercent(0);
      };
    }
  }, [isLoading]);
  
  const displayPercent = Math.min(99, Math.floor(progressPercent));
  
  const handleClick = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    onClick();
  };
  
  return (
    <>
      <Button
        variant={isActive ? "default" : "outline"}
        size="sm"
        className={`relative overflow-hidden transition-all duration-200 ease-in-out flex items-center gap-1.5 min-w-[120px] z-50
          ${isActive ? 'bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 dark:hover:bg-blue-900/60' : ''}
          ${!user ? 'opacity-50 cursor-not-allowed' : ''}
          p-2 cursor-pointer`}
        onClick={handleClick}
        disabled={isLoading}
        aria-busy={isLoading}
        aria-pressed={isActive}
        title={!user ? "Sign in to use this feature" : undefined}
        style={{ 
          touchAction: 'manipulation',
          zIndex: 50,
          position: 'relative'
        }}
      >
        {isLoading ? (
          <>
            <span className="relative flex h-3 w-3 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            <span className="truncate">Humanizing...</span>
            {progressPercent > 0 && (
              <span className="ml-1 opacity-60 text-xs">
                {displayPercent}%
              </span>
            )}
          </>
        ) : (
          <>
            {!user ? (
              <Lock className="h-4 w-4 text-zinc-500" />
            ) : (
              <UserCheck size={15} className={`${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
            )}
            <span>{isActive ? 'Humanized' : 'Humanize'}</span>
          </>
        )}
        
        {isLoading && (
          <div 
            className="absolute bottom-0 left-0 h-0.5 bg-blue-500 animate-progress"
            style={{ width: `${progressPercent}%` }}
          ></div>
        )}
      </Button>

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </>
  );
};

// Add GlobalLoadingIndicator component
const GlobalLoadingIndicator = ({ isLoading, message }: { isLoading: boolean; message: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (isLoading) {
      setIsVisible(true);
    } else {
      // Delay hiding to allow for the fade-out animation
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);
  
  if (!isVisible && !isLoading) return null;
  
  return (
    <div 
      className={`fixed top-0 left-0 w-full z-50 flex items-center justify-center bg-blue-500 text-white py-1.5 px-4 shadow-md transition-all duration-300 ease-in-out ${
        isLoading ? 'animate-slideDown' : 'animate-slideUp'
      }`}
      style={{ 
        backgroundImage: 'linear-gradient(to right, rgba(59, 130, 246, 0.9), rgba(37, 99, 235, 0.9))'
      }}
    >
      <div className="flex items-center gap-2 max-w-screen-lg w-full mx-auto">
        <div className="relative flex-shrink-0">
          <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
        </div>
        <span className="text-sm font-medium">{message}</span>
        <div className="ml-auto text-xs opacity-80">Please wait...</div>
      </div>
    </div>
  );
};

// Update the TextActionFAB component 
function TextActionFAB({ 
  visible, 
  onHumanizeClick,
  onClose
}: { 
  visible: boolean;
  onHumanizeClick: () => void;
  onClose: () => void;
}) {
  // Add loading state - moved outside conditional
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  // Add progress indicator - moved outside conditional
  const [progress, setProgress] = useState(0);
  // Add state to control visibility independently
  const [isVisible, setIsVisible] = useState(false);
  
  // Update visibility when prop changes
  useEffect(() => {
    if (visible) {
      setIsVisible(true);
    } else if (!isLocalLoading) {
      // Only hide if not currently loading
      setIsVisible(false);
    }
  }, [visible, isLocalLoading]);
  
  // Set up progress animation similar to HumanizeButton
  useEffect(() => {
    if (isLocalLoading) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev < 20) return prev + Math.random() * 10;
          if (prev < 50) return prev + Math.random() * 5;
          if (prev < 80) return prev + Math.random() * 2;
          if (prev < 90) return prev + Math.random() * 0.5;
          return prev;
        });
      }, 300);
      
      return () => {
        clearInterval(interval);
        setProgress(0);
      };
    }
  }, [isLocalLoading]);
  
  // Handle click with loading state
  const handleHumanizeClick = useCallback(() => {
    // Set loading state immediately
    setIsLocalLoading(true);
    
    // Use a more reliable approach with setTimeout
    setTimeout(async () => {
      try {
        console.log("Floating button clicked, calling humanize function");
        await onHumanizeClick();
        console.log("Humanization completed successfully");
      } catch (error) {
        console.error("Error during humanization:", error);
      } finally {
        // Reset loading state after a delay to ensure animation completes
        setTimeout(() => {
          setIsLocalLoading(false);
          // Only close the button after loading is complete
          onClose();
        }, 800);
      }
    }, 50); // Small delay to ensure UI updates before processing
  }, [onHumanizeClick, onClose]);
  
  const displayPercent = Math.min(99, Math.floor(progress));
  
  // Early return after hooks - but based on our internal state
  if (!isVisible) return null;
  
  return (
    <div 
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2"
      style={{
        animation: 'fadeInUp 0.3s ease-out'
      }}
    >
      <button
        onClick={handleHumanizeClick}
        disabled={isLocalLoading}
        className={`flex items-center justify-center gap-2 bg-blue-600 text-white rounded-full px-4 py-3 shadow-lg hover:bg-blue-700 transition-all duration-200 instant-appear overflow-hidden ${
          isLocalLoading ? 'opacity-90' : ''
        }`}
        style={{
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
          animation: isLocalLoading ? 'none' : 'pulse 2s infinite',
          minWidth: isLocalLoading ? '180px' : 'auto',
          touchAction: 'manipulation',
          zIndex: 100,
          position: 'relative',
          minHeight: '48px',
          paddingLeft: '16px',
          paddingRight: '16px'
        }}
      >
        {isLocalLoading ? (
          <>
            <div className="relative flex h-4 w-4 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
            </div>
            <span className="whitespace-nowrap">Humanizing... {displayPercent}%</span>
            
            {/* Progress bar */}
            <div 
              className="absolute bottom-0 left-0 h-1 bg-white/50"
              style={{ width: `${progress}%` }}
            ></div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center rounded-full bg-white/20 p-1">
              <UserCheck className="h-4 w-4" />
            </div>
            <span className="font-medium">Humanize</span>
          </>
        )}
      </button>
    </div>
  );
}

// Update the PermanentActionButton component
function PermanentActionButton({ 
  onHumanizeClick,
  hasSelection
}: { 
  onHumanizeClick: () => void;
  hasSelection: boolean;
}) {
  // Use hover state to expand buttons on hover
  const [isHovered, setIsHovered] = useState(false);
  // Use a ref to check if we're on mobile
  const [isMobile, setIsMobile] = useState(false);
  // Add loading state
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  // Add progress indicator
  const [progress, setProgress] = useState(0);
  // Add state to control visibility independently
  const [isVisible, setIsVisible] = useState(false);
  
  // Update visibility when prop changes
  useEffect(() => {
    if (hasSelection) {
      setIsVisible(true);
    } else if (!isLocalLoading) {
      // Only hide if not currently loading
      setIsVisible(false);
    }
  }, [hasSelection, isLocalLoading]);
  
  // Set up progress animation
  useEffect(() => {
    if (isLocalLoading) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev < 20) return prev + Math.random() * 10;
          if (prev < 50) return prev + Math.random() * 5;
          if (prev < 80) return prev + Math.random() * 2;
          if (prev < 90) return prev + Math.random() * 0.5;
          return prev;
        });
      }, 300);
      
      return () => {
        clearInterval(interval);
        setProgress(0);
      };
    }
  }, [isLocalLoading]);
  
  // Handle button click with improved timing
  const handleClick = useCallback(() => {
    // Set loading immediately to prevent button disappearing
    setIsLocalLoading(true);
    
    // Use setTimeout for better reliability
    setTimeout(async () => {
      try {
        console.log("Side button clicked, calling humanize function");
        await onHumanizeClick();
        console.log("Humanization completed successfully");
      } catch (error) {
        console.error("Error during humanization:", error);
      } finally {
        // Reset after a delay to ensure animations complete
        setTimeout(() => {
          setIsLocalLoading(false);
        }, 800);
      }
    }, 50);
  }, [onHumanizeClick]);
  
  // Check for mobile on component mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const displayPercent = Math.min(99, Math.floor(progress));
  
  // Don't render anything if not visible - based on our internal state
  if (!isVisible) return null;
  
  return (
    <div 
      className={`fixed left-0 top-1/2 transform -translate-y-1/2 z-50 permanent-btn-container-left ${
        isLocalLoading ? '' : 'permanent-btn-active-left'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Humanize Button */}
      <button
        onClick={handleClick}
        disabled={isLocalLoading}
        className={`permanent-btn-left active overflow-hidden ${
          isLocalLoading ? 'opacity-90' : ''
        }`}
        style={{
          width: isMobile ? '70px' : (isLocalLoading ? '170px' : (isHovered ? '150px' : '90px')),
          padding: isMobile ? '1rem' : '0.85rem',
        }}
        title="Humanize selected text"
      >
        <div className="flex items-center gap-3">
          {isLocalLoading ? (
            <>
              <div className="rounded-full p-1 bg-white/20 relative">
                <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
              </div>
              {!isMobile && (
                <span className={`font-medium whitespace-nowrap transition-opacity duration-300 opacity-100 text-sm`}>
                  {displayPercent}%
                </span>
              )}
              
              {/* Progress bar */}
              <div 
                className="absolute bottom-0 left-0 h-1 bg-white/30"
                style={{ width: `${progress}%` }}
              ></div>
            </>
          ) : (
            <>
              <div className="rounded-full p-1.5 bg-white/20">
                <UserCheck className={`${isMobile ? 'h-7 w-7' : 'h-6 w-6'} text-white`} />
              </div>
              <span className={`font-medium whitespace-nowrap transition-opacity duration-300 ${isMobile ? 'hidden' : (isHovered ? 'opacity-100 text-sm' : 'opacity-80 text-sm')}`}>
                Humanize
              </span>
            </>
          )}
        </div>
      </button>
    </div>
  );
}

export function AnswerSection({
  content,
  isOpen,
  onOpenChange,
  chatId,
  messageId
}: AnswerSectionProps) {
  const { user, isLoaded } = useUser()
  const enableShare = process.env.NEXT_PUBLIC_ENABLE_SHARE === 'true'
  const [humanizedText, setHumanizedText] = useState<string>('')
  const [isHumanized, setIsHumanized] = useState<boolean>(false)
  const [showSummarizationPopup, setShowSummarizationPopup] = useState(false)
  const [summarizationTone, setSummarizationTone] = useState('')
  const [summarizationInput, setSummarizationInput] = useState('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(content)
  const [selectedText, setSelectedText] = useState('');
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectionIndices, setSelectionIndices] = useState<{ start: number, end: number } | null>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const contentContainerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showFAB, setShowFAB] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isGeneratingAcademic, setIsGeneratingAcademic] = useState(false)
  // Tutor state
  const [isTutorModalOpen, setIsTutorModalOpen] = useState(false);
  const [isTutorLoading, setIsTutorLoading] = useState(false);
  const [tutorQuestion, setTutorQuestion] = useState('');
  const [tutorResult, setTutorResult] = useState<string | null>(null);
  const [handleTutorAsk, setHandleTutorAsk] = useState<() => void>(() => {});

  // Add auto-dismiss effect
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  // Use the chatId with the CHAT_ID default
  const chatId_final = chatId || CHAT_ID
  
  // Use the chat hook directly
  const { setMessages, messages, append, isLoading: isGenerating } = useChat({ id: chatId_final });
  
  // Update editedContent when content changes
  useEffect(() => {
    setEditedContent(content)
  }, [content])
  
  // Function to call the humanization API with useCallback
  const callHumanizationAPI = useCallback(async (text: string, useWordLevel: boolean = true): Promise<string> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      console.log('Calling humanization API with text length:', text.length, 'useWordLevel:', useWordLevel);
      
      const response = await fetch('/api/humanize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, type: 'summary', useWordLevel }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Humanization API error:', response.status, errorData);
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data || !data.humanizedText) {
        console.error('API returned invalid data structure:', data);
        throw new Error('Received invalid response from server');
      }
      
      return data.humanizedText;
    } catch (error) {
      console.error('Error humanizing text:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      // Pass through the error message
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }, []);
  
  // Function to preserve container height during loading
  const preserveContainerHeight = useCallback(() => {
    if (contentContainerRef.current) {
      const height = contentContainerRef.current.offsetHeight;
      if (height > 0) {
        setContainerHeight(height);
      }
    }
  }, []);

  // Function to release container height after loading
  const releaseContainerHeight = useCallback(() => {
    setTimeout(() => {
      setContainerHeight(null);
    }, 100); // Small delay to ensure smooth transition
  }, []);

  // Modified humanizeText function with authentication check
  const humanizeText = useCallback(async () => {
    if (!content) return;
    
    // Check if user is logged in
    if (!user) {
      toast.error("Please sign in to use this feature", {
        position: "bottom-center",
        duration: 2000,
      });
      return;
    }
    
    // Reset any previous error
    setError(null);
    
    // Save current scroll position
    const scrollPosition = window.scrollY;
    
    // Preserve container height before loading
    preserveContainerHeight();
    
    setIsLoading(true);
    try {
      // Use word-level humanization first, then AI
      const humanizedResult = await callHumanizationAPI(content, true);
      setHumanizedText(humanizedResult);
      setIsHumanized(true);
    } catch (error) {
      console.error('Error in humanization:', error);
      // User-friendly error message
      setError(error instanceof Error ? error.message : 'Humanization failed. Please try again.');
    } finally {
      setIsLoading(false);
      
      // Release container height after loading
      releaseContainerHeight();
      
      // Restore scroll position after state updates
      setTimeout(() => {
        window.scrollTo({
          top: scrollPosition,
          behavior: 'auto'
        });
      }, 0);
    }
  }, [content, callHumanizationAPI, preserveContainerHeight, releaseContainerHeight, user]);

  const handleEdit = () => {
    // Check if user is logged in
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setIsEditing(true)
  }

  const handleCancel = () => {
    setEditedContent(content)
    setIsEditing(false)
  }

  const handleSave = async (newContent: string) => {
    if (newContent.trim() === content.trim()) {
      setIsEditing(false)
      return
    }

    // Update the edited content state
    setEditedContent(newContent)

    // Find the current message
    const messageIndex = messages.findIndex((m: { id: string }) => m.id === messageId)
    if (messageIndex === -1) return

    // Create a new messages array with the edited content
    const updatedMessages = [...messages]
    updatedMessages[messageIndex] = {
      ...updatedMessages[messageIndex],
      content: newContent
    }
    
    // Update the messages state
    setMessages(updatedMessages)
    setIsEditing(false)
  }

  const handleHumanizeClick = useCallback(() => {
    // Save scroll position before toggling humanized state
    const scrollPosition = window.scrollY;
    
    // Preserve container height
    preserveContainerHeight();
    
    if (isHumanized) {
      setIsHumanized(false);
      
      // Restore scroll position and release height constraint after state update
      setTimeout(() => {
        window.scrollTo({
          top: scrollPosition,
          behavior: 'auto'
        });
        releaseContainerHeight();
      }, 0);
    } else {
      humanizeText();
    }
  }, [isHumanized, humanizeText, preserveContainerHeight, releaseContainerHeight]);


  const handleAcademicSummary = useCallback(() => {
    setSummarizationTone('academic');
    setSummarizationInput(content);
    setShowSummarizationPopup(true);
  }, [content]);

  // Helper function to find paragraph end - improved to strictly find the end of current paragraph
  const findParagraphEnd = (text: string, startPos: number): number => {
    // Look for double newline as paragraph boundary
    const doubleNewlinePos = text.indexOf('\n\n', startPos);
    if (doubleNewlinePos !== -1) {
      return doubleNewlinePos + 2; // Include the double newline to maintain formatting
    }
    
    // Look for single newline followed by non-whitespace (indicating a new paragraph)
    for (let i = startPos; i < text.length; i++) {
      if (text[i] === '\n' && i+1 < text.length && text[i+1] !== ' ' && text[i+1] !== '\t') {
        return i + 1; // Include the newline to maintain formatting
      }
    }
    
    // If no paragraph boundary found, go to the end of the text
    return text.length;
  };

  // Helper function to find paragraph start - improved to find exact paragraph start
  const findParagraphStart = (text: string, pos: number): number => {
    // If we're already at the start of the text, return 0
    if (pos === 0) return 0;
    
    // Search backwards for double newline (most reliable paragraph separator)
    const prevDoubleNewline = text.lastIndexOf('\n\n', pos);
    if (prevDoubleNewline !== -1) {
      return prevDoubleNewline + 2; // +2 to skip the double newline
    }
    
    // Search backwards for a newline followed by non-whitespace (indicating a new paragraph)
    for (let i = pos; i > 0; i--) {
      if (text[i-1] === '\n' && (i === 1 || text[i-2] !== '\n')) {
        return i; // Position after the newline
      }
    }
    
    // If no paragraph boundary found, start from beginning of text
    return 0;
  };
  
  // Update the handleTextSelection function to make the menu more visible
  const handleTextSelection = useCallback(() => {
    // This function is now replaced by the more comprehensive implementation in the useEffect hook
    // Keeping it as an empty function to maintain compatibility with existing event handlers
  }, []);

  // Helper function to escape special regex characters
  const escapeRegExp = useCallback((string: string): string => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }, []);

  // Handle clicking outside to close menu
  useEffect(() => {
    if (!menuPosition && !showFAB) return; // No need to add listener if menu is not open
    
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click is outside both the message container and the floating menu/FAB
      const isClickOutsideMessage = !messageRef.current?.contains(event.target as Node);
      const isClickOutsideMenu = !document.querySelector('.floating-menu-container')?.contains(event.target as Node);
      const isClickOutsideFAB = !document.querySelector('.fixed.bottom-6.right-6')?.contains(event.target as Node);
      
      console.log("Click detected, outside message:", isClickOutsideMessage, "outside menu:", isClickOutsideMenu);
      
      if (isClickOutsideMessage && isClickOutsideMenu && isClickOutsideFAB) {
        // Close both the menu and FAB with a slight delay to allow buttons to process clicks
        setTimeout(() => {
        setMenuPosition(null);
          setShowFAB(false);
        setSelectedText('');
          setSelectionIndices(null);
        }, 100);
      }
    };

    // Add the event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Clean up the event listener
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuPosition, showFAB]);

  // Update the humanize text function with improved selection handling
  const handleHumanizeSelection = useCallback(async () => {
    return new Promise<void>(async (resolve, reject) => {
      // Initialize scrollY at the top level of the function
      const scrollY = window.scrollY;
      
      try {
        console.log("Selection data:", { selectedText, selectionIndices });
        if (!selectedText || !selectionIndices) {
          console.error("No text is selected or selection indices are missing");
          reject(new Error("No text selected"));
          return;
        }
        
        // Preserve container height
        preserveContainerHeight();
        
        // Set global loading state
        setIsLoading(true);
        
        // Don't clear selection state/menus here - let components handle their own visibility
        // Store selection data locally to avoid state issues
        const localSelectionStart = selectionIndices.start;
        const localSelectionEnd = selectionIndices.end;
        const localContent: string = isHumanized ? humanizedText : editedContent;
        const selText: string = localContent.substring(localSelectionStart, localSelectionEnd);
        
        console.log("Humanizing text:", selText, "from position", localSelectionStart, "to", localSelectionEnd);
        
        // Call the humanization API with word-level processing enabled
        const response = await fetch('/api/humanize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: selText, type: 'summary', useWordLevel: true }),
        });

        if (!response.ok) {
          throw new Error('Failed to humanize text');
        }

        const data = await response.json();
      
        // Log the response to help debug
        console.log('Humanize API response (selection):', data);
      
        let resultText = data.humanizedText || '';
      
        if (!resultText) {
          console.error('Humanize API did not return expected data structure');
          reject(new Error("Invalid API response"));
          return;
        }
      
        // Clean up the response text
        resultText = cleanApiResponseText(resultText);
      
        // Preserve paragraph style (preserving line breaks at boundaries)
        const originalEndsWithNewline = selText.endsWith('\n');
        const originalStartsWithNewline = selText.startsWith('\n');
        
        // If the original text had line breaks at the boundaries, preserve them
        if (originalStartsWithNewline && !resultText.startsWith('\n')) {
          resultText = '\n' + resultText;
        }
        if (originalEndsWithNewline && !resultText.endsWith('\n')) {
          resultText = resultText + '\n';
        }
        
        // Replace only at the stored indices
        const before = localContent.substring(0, localSelectionStart);
        const after = localContent.substring(localSelectionEnd);
        const newText = before + resultText + after;
      
        // Update the state based on current mode
        if (isHumanized) {
          setHumanizedText(newText);
        } else {
          setEditedContent(newText);
        }
      
        // Update the messages state for consistency
        const messageIndex = messages.findIndex((m: { id: string }) => m.id === messageId);
        if (messageIndex !== -1) {
          const updatedMessages = [...messages];
          updatedMessages[messageIndex] = {
            ...updatedMessages[messageIndex],
            content: newText
          };
          setMessages(updatedMessages);
        }
      
        // Update selection indices for the new content
        setSelectionIndices({
          start: localSelectionStart,
          end: localSelectionStart + resultText.length
        });
      
        // Keep the selected text updated with the new content
        setSelectedText(resultText);
          
        // Resolve the promise to indicate successful completion
        resolve();
      } catch (error) {
        console.error('Error humanizing text:', error);
        reject(error);
      } finally {
        // Set loading to false with a slight delay to avoid UI flickering
        setTimeout(() => {
          setIsLoading(false);
            
          // Release container height after loading
          releaseContainerHeight();
            
          // Restore scroll position after state updates
          window.scrollTo({
            top: scrollY || 0,
            behavior: 'auto'
          });
        }, 100);
      }
    });
  }, [selectedText, selectionIndices, editedContent, humanizedText, isHumanized, messages, messageId, setMessages, preserveContainerHeight, releaseContainerHeight, cleanApiResponseText]);

  // Update the rewrite text function with similar approach
  const handleRewriteSelection = useCallback(async () => {
    return new Promise<void>(async (resolve, reject) => {
      // Initialize scrollY at the top level of the function
      const scrollY = window.scrollY;
      
      try {
        if (!selectedText || !selectionIndices) {
          console.error("No text is selected or selection indices are missing");
          reject(new Error("No text selected"));
          return;
        }
        
        // Preserve container height
        preserveContainerHeight();
        
        // Set global loading state
        setIsLoading(true);
        
        // Don't clear selection state or menus - let components handle their own visibility
        // Store selection data locally to avoid state issues
        const localSelectionStart = selectionIndices.start;
        const localSelectionEnd = selectionIndices.end;
        const localContent: string = isHumanized ? humanizedText : editedContent;
        const selText: string = localContent.substring(localSelectionStart, localSelectionEnd);
        
        console.log("Rewriting text:", selText, "from position", localSelectionStart, "to", localSelectionEnd);
        
        // Get rewritten text
      const response = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: selText }),
      });
      
      if (!response.ok) throw new Error('Rewrite failed');
        const data = await response.json();
      
      // Log the response to help debug
        console.log('Rewrite API response:', data);
      
      let resultText = data.rewrittenText || '';
      
      if (!resultText) {
        console.error('Rewrite API did not return expected data structure');
          reject(new Error("Invalid API response"));
        return;
      }
      
        // Clean up the response text
        resultText = cleanApiResponseText(resultText);
      
      // Preserve paragraph style (preserving line breaks at boundaries)
      const originalEndsWithNewline = selText.endsWith('\n');
      const originalStartsWithNewline = selText.startsWith('\n');
      
      // If the original text had line breaks at the boundaries, preserve them
      if (originalStartsWithNewline && !resultText.startsWith('\n')) {
        resultText = '\n' + resultText;
      }
      if (originalEndsWithNewline && !resultText.endsWith('\n')) {
        resultText = resultText + '\n';
      }
      
      // Replace only at the stored indices
        const before = localContent.substring(0, localSelectionStart);
        const after = localContent.substring(localSelectionEnd);
      const newText = before + resultText + after;
      
      // Update the state based on current mode
      if (isHumanized) {
        setHumanizedText(newText);
      } else {
        setEditedContent(newText);
      }
      
      // Update the messages state for consistency
      const messageIndex = messages.findIndex((m: { id: string }) => m.id === messageId);
      if (messageIndex !== -1) {
        const updatedMessages = [...messages];
        updatedMessages[messageIndex] = {
          ...updatedMessages[messageIndex],
          content: newText
        };
        setMessages(updatedMessages);
      }
      
      // Update selection indices for the new content
      setSelectionIndices({
          start: localSelectionStart,
          end: localSelectionStart + resultText.length
      });
      
      // Keep the selected text updated with the new content
      setSelectedText(resultText);
        
        // Resolve the promise to indicate successful completion
        resolve();
    } catch (error) {
      console.error('Error rewriting text:', error);
        reject(error);
    } finally {
        // Set loading to false with a slight delay to avoid UI flickering
        setTimeout(() => {
      setIsLoading(false);
          
          // Release container height after loading
          releaseContainerHeight();
          
          // Restore scroll position after state updates
          window.scrollTo({
            top: scrollY || 0,
            behavior: 'auto'
          });
        }, 100);
      }
    });
  }, [selectedText, selectionIndices, editedContent, humanizedText, isHumanized, messages, messageId, setMessages, preserveContainerHeight, releaseContainerHeight, cleanApiResponseText]);

  // Add useEffect to maintain the menu position when content changes
  useEffect(() => {
    if (menuPosition && selectionIndices) {
      // If we have an active selection and menu, keep the menu in the same position
      // to avoid it jumping around when content changes
      const handleContentChange = () => {
        // No need to adjust position - we want it to stay where it was
      };
      
      handleContentChange();
    }
  }, [editedContent, humanizedText, menuPosition, selectionIndices]);

  // Close the floating menu
  const handleCloseMenu = useCallback(() => {
    setMenuPosition(null);
    setSelectedText('');
    setSelectionIndices(null);
  }, []);

  // Generate a unique key for the editor that changes when editedContent changes
  // This forces the SlateEditor to completely unmount and remount with the new content
  const editorKey = useMemo(() => `editor-${editedContent.length}-${Date.now()}`, [editedContent]);

  // Update the SlateEditor component to handle content updates
  const SlateEditorWithUpdates = useMemo(() => {
    return (
      <SlateEditor
        content={editedContent}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }, [editedContent, handleSave, handleCancel]);

  const header = (
    <div className="flex items-center gap-1">
      <Text size={16} />
      <div>Answer</div>
    </div>
  )
  
  const message = content ? (
    <div className="flex flex-col gap-1 w-full">
      <div 
        className="w-full overflow-hidden content-preserving-container"
        ref={messageRef}
        style={containerHeight ? { minHeight: `${containerHeight}px` } : undefined}
      >
        {/* Remove debugging information */}
        
        <div 
          ref={contentContainerRef}
          className="w-full"
          style={{ touchAction: 'auto', userSelect: 'text' }}
      >
        {isEditing ? (
            <div className="w-full max-w-full overflow-hidden mobile-message-container content-container">
          <SlateEditor
            key={editorKey}
            content={editedContent}
            onSave={handleSave}
            onCancel={handleCancel}
          />
            </div>
        ) : (
          <BotMessage 
            message={isHumanized ? humanizedText : editedContent} 
            className="max-w-full break-words content-container text-selection-container"
            isLoading={isGenerating}
            style={{ touchAction: 'pan-y', userSelect: 'text', WebkitUserSelect: 'text' }}
          />
        )}
        </div>
        
        <FloatingMenu
          position={menuPosition}
          onHumanize={handleHumanizeSelection}
          onRewrite={handleRewriteSelection}
          onClose={handleCloseMenu}
        />

        {/* Display error message if there is one */}
        {error && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center gap-3 animate-slideUp">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">Sign in to use this feature</p>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-wrap justify-between items-center gap-1 mt-2">
        <div className="flex items-center gap-1">
          <HumanizeButton 
            onClick={handleHumanizeClick}
            isLoading={isLoading} 
            isActive={isHumanized} 
          />
          {isHumanized && (
          <Button
              variant="ghost"
            size="sm"
            className="h-8 flex items-center gap-1 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
              onClick={() => setIsHumanized(false)}
              title="Revert to original text"
              aria-label="Revert to original text"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="text-xs">Revert</span>
          </Button>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {!isEditing && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleEdit}
              className="h-8 w-8"
              aria-label={user ? "Edit content" : "Sign in to edit content"}
              title={user ? "Edit content" : "Sign in to edit content"}
            >
              <Pencil className={`h-4 w-4 ${!user ? 'opacity-50' : ''}`} />
            </Button>
          )}
          <MessageActions
            message={isHumanized ? humanizedText : editedContent}
            chatId={chatId}
            messageId={messageId}
            enableShare={enableShare}
          />
          <ExportOptions content={isHumanized ? humanizedText : editedContent} title="AI Research Report" />
        </div>
      </div>
    </div>
  ) : (
    // Use BotMessage with empty content which will show skeleton 
    // instead of DefaultSkeleton to maintain position
    <BotMessage message="" isLoading={true} />
  )
  
  // Memoize the SummarizationPopup component to prevent unnecessary re-renders
  const summarizationPopup = useMemo(() => {
    if (!showSummarizationPopup) return null;
    return (
      <SummarizationPopup
        input={summarizationInput}
        tone={summarizationTone}
        onClose={() => setShowSummarizationPopup(false)}
      />
    );
  }, [showSummarizationPopup, summarizationInput, summarizationTone]);
  
  // Add this effect to detect text selection directly via onSelectionChange
  useEffect(() => {
    // Function to process selected text and find its position in the content
    const processTextSelection = (selectedText: string) => {
      try {
        // Get the current content
        const currentContent = isHumanized ? humanizedText : editedContent;
        
        // Find exact selection position (limit to first 100 chars for performance)
        const selectionPattern = selectedText.substring(0, Math.min(selectedText.length, 100));
        const escapedPattern = escapeRegExp(selectionPattern);
        const selectionRegex = new RegExp(escapedPattern, 'g');
        
        let match;
        let exactMatches = [];
        
        while ((match = selectionRegex.exec(currentContent)) !== null) {
          exactMatches.push({
            start: match.index,
            end: match.index + selectionPattern.length
          });
        }
        
        let startIndex = -1;
        let endIndex = -1;
        
        if (exactMatches.length > 0) {
          startIndex = exactMatches[0].start;
          endIndex = exactMatches[0].end;
          
          // If we matched just a substring, extend to the full selection length
          if (endIndex - startIndex < selectedText.length) {
            endIndex = Math.min(startIndex + selectedText.length, currentContent.length);
          }
        } else {
          // Fallback logic for inexact matches
          const firstFewChars = selectedText.substring(0, Math.min(30, selectedText.length));
          const lastFewChars = selectedText.substring(Math.max(0, selectedText.length - 30));
          
          const firstAnchorPos = currentContent.indexOf(firstFewChars);
          
          if (firstAnchorPos !== -1) {
            const searchStart = firstAnchorPos + firstFewChars.length;
            const lastAnchorPos = currentContent.indexOf(lastFewChars, searchStart - 30);
            
            if (lastAnchorPos !== -1 && lastAnchorPos + lastFewChars.length >= firstAnchorPos) {
              startIndex = firstAnchorPos;
              endIndex = lastAnchorPos + lastFewChars.length;
            } else {
              startIndex = firstAnchorPos;
              endIndex = Math.min(
                startIndex + selectedText.length * 2,
                findParagraphEnd(currentContent, firstAnchorPos)
              );
            }
          }
        }
        
        if (startIndex !== -1 && endIndex !== -1) {
          // Find paragraph boundaries for better context
          const paragraphStart = findParagraphStart(currentContent, startIndex);
          const paragraphEnd = findParagraphEnd(currentContent, startIndex);
          
          const maxParagraphLength = 3000;
          
          if (paragraphEnd - paragraphStart <= maxParagraphLength) {
            startIndex = paragraphStart;
            endIndex = paragraphEnd;
          } else {
            startIndex = Math.max(0, startIndex - 50);
            endIndex = Math.min(currentContent.length, endIndex + 50);
          }
          
          const selectedWithContext = currentContent.substring(startIndex, endIndex);
          setSelectionIndices({
            start: startIndex,
            end: endIndex
          });
          
          return { selectedWithContext, startIndex, endIndex };
        }
        
        return null;
      } catch (error) {
        console.error("Error processing text selection:", error);
        return null;
      }
    };
    
    // Main function to handle selection changes
    const checkForSelection = () => {
      requestAnimationFrame(() => {
        try {
          const selection = window.getSelection();
          
          // Check if there's an actual selection
          if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
            return;
          }
          
          // Get selected text
          const rawText = selection.toString().trim();
          if (!rawText) return;
          
          // Check if selection is within our content container
          const isWithinContainer = messageRef.current?.contains(selection.anchorNode as Node);
          if (!isWithinContainer) return;
          
          // Get the selection range for positioning
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          
          // Store basic selected text immediately
          setSelectedText(rawText);
          
          // Show FAB for guaranteed visibility on mobile
          setShowFAB(true);
          
          // Set menu position
          let menuX, menuY;
          
          if (window.innerWidth >= 768) {
            // Desktop: Position to the right of selection
            menuX = rect.right + 15;
            menuY = rect.top + (rect.height / 2);
            
            // Adjust if near screen edge
            if (menuX > window.innerWidth - 150) {
              menuX = Math.max(10, rect.left - 15);
            }
          } else {
            // Mobile: Position centered above selection
            menuX = rect.left + (rect.width / 2);
            menuY = rect.top - 10;
          }
          
          setMenuPosition({ x: menuX, y: menuY });
          
          // Process selection to get full context
          const result = processTextSelection(rawText);
          if (result) {
            setSelectedText(result.selectedWithContext);
          }
          
          // Log for debugging
          console.log("Selection detected:", {
            text: rawText.substring(0, 30) + "...",
            length: rawText.length,
            inContainer: isWithinContainer,
            position: { x: menuX, y: menuY }
          });
        } catch (error) {
          console.error("Error in selection handler:", error);
        }
      });
    };
    
    // Handle selection change event
    const handleSelectionChange = () => {
      checkForSelection();
    };
    
    // Handle mouse up event
    const handleMouseUp = () => {
      setTimeout(checkForSelection, 10);
    };
    
    // Handle touch end event for mobile
    const handleTouchEnd = () => {
      setTimeout(checkForSelection, 50);
    };
    
    // Add all event listeners
    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleTouchEnd);
    
    // Clean up all listeners
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [messageRef, isHumanized, humanizedText, editedContent, findParagraphEnd, findParagraphStart, escapeRegExp]);
  
  return (
    <div className="flex items-start gap-2">
      <style dangerouslySetInnerHTML={{ __html: floatingMenuStyles }} />
      <GlobalLoadingIndicator isLoading={isLoading} message="Humanizing content..." />
      <div className="flex-1 height-transition">
        <CollapsibleMessage
          role="assistant"
          isCollapsible={false}
          header={header}
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          showBorder={false}
        >
          {message}
        </CollapsibleMessage>
        {summarizationPopup}
      </div>
      <TextActionFAB
        visible={showFAB}
        onHumanizeClick={handleHumanizeSelection}
        onClose={handleCloseMenu}
      />
      <PermanentActionButton
        onHumanizeClick={handleHumanizeSelection}
        hasSelection={Boolean(selectedText)}
      />
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
      {isTutorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-0 max-w-md w-full flex flex-col" style={{ maxHeight: '90vh' }}>
            <div className="flex items-center gap-2 px-6 pt-6 pb-2">
              <GraduationCap className="h-5 w-5 text-emerald-500" />
              <span className="font-semibold text-lg">Tutor Assistant</span>
            </div>
            <div className="flex-1 overflow-y-auto px-6" style={{ maxHeight: '50vh' }}>
              {tutorResult && (() => {
                // Split the result into explanation and follow-up questions
                const followupHeader = /Follow[- ]?up Questions?:/i;
                const parts = tutorResult.split(followupHeader);
                const explanation = parts[0]?.replace(/^Explanation:/i, '').trim();
                let followups: string[] = [];
                if (parts[1]) {
                  // Extract numbered or bulleted questions
                  followups = parts[1].split(/\n|\r/)
                    .map(line => line.trim())
                    .filter(line => line.match(/^\d+\.|[-*]/));
                  // If not found, fallback to all non-empty lines
                  if (followups.length === 0) {
                    followups = parts[1].split(/\n|\r/).map(line => line.trim()).filter(Boolean);
                  }
                }
                return (
                  <div className="text-sm text-zinc-800 dark:text-zinc-100 mb-4 text-left prose prose-sm dark:prose-invert max-w-none">
                    {explanation && <ReactMarkdown>{explanation}</ReactMarkdown>}
                    {followups.length > 0 && (
                      <div className="mt-4">
                        <div className="font-semibold mb-1">Follow-up Questions:</div>
                        <ol className="list-decimal ml-5">
                          {followups.map((q, i) => (
                            <li key={i}>{q.replace(/^\d+\.|[-*]/, '').trim()}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
            <div className="w-full px-6 pb-6 pt-2 bg-white dark:bg-zinc-900 flex flex-col gap-2 sticky bottom-0">
              <input
                type="text"
                className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-background text-sm"
                placeholder="What part don't you understand? Ask a question..."
                value={tutorQuestion}
                onChange={e => setTutorQuestion(e.target.value)}
                disabled={isTutorLoading}
                onKeyDown={e => { if (e.key === 'Enter') handleTutorAsk(); }}
              />
              <Button
                onClick={handleTutorAsk}
                disabled={isTutorLoading || !tutorQuestion.trim()}
                className="w-full"
              >
                {isTutorLoading ? 'Loading...' : 'Ask Tutor'}
              </Button>
              <Button onClick={() => { setIsTutorModalOpen(false); setTutorResult(null); setTutorQuestion(''); }} className="w-full" variant="outline">Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
