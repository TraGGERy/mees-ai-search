'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { AI, UIState } from '@/app/actions'
import { useUIState, useActions, useAIState } from 'ai/rsc'
import { cn } from '@/lib/utils'
import { UserMessage } from './user-message'
import { Button } from './ui/button'
import { ArrowRight, CodeIcon, Keyboard, Plus, Settings, User, User2 } from 'lucide-react'
import { EmptyScreen } from './empty-screen'
import Textarea from 'react-textarea-autosize'
import { generateId } from 'ai'
import { useAppState } from '@/lib/utils/app-state'
import { AnimatedTooltipPreview } from './xui/floating'
import reactElementToJSXString from 'react-element-to-jsx-string'
import { TextGenerateEffectDemo } from './xui/headline'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { DropdownMenuGroup, DropdownMenuLabel, DropdownMenuSeparator } from '@radix-ui/react-dropdown-menu'
import { IconAlien, IconBrandCodesandbox, IconBrandOpenai, IconLighter, IconPlayerSkipForwardFilled, IconPlayerTrackNext, IconRobotFace, IconSparkles, IconUser } from '@tabler/icons-react'
import { getModel } from '@/lib/utils'
import { SignInButton, SignOutButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs'

interface ChatPanelProps {
  messages: UIState
  query?: string
}

export function ChatPanel({ messages, query }: ChatPanelProps) {
  const [input, setInput] = useState('')
  const[myEnVar, SetMyEnvVar]=useState(process.env.OPENAI_API_MODEL || 'gpt-4o-mini');
  const [showEmptyScreen, setShowEmptyScreen] = useState(false)
  const [, setMessages] = useUIState<typeof AI>()
  const [aiMessage, setAIMessage] = useAIState<typeof AI>()
  const { isGenerating, setIsGenerating } = useAppState()
  const { submit } = useActions()
  const router = useRouter()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const isFirstRender = useRef(true) // For development environment
  const {user,isSignedIn}=useUser();
  const [selectedValue, setSelectedValue] = useState('Speed');

  const handleDropdownChange = (value: any) => {
    setSelectedValue(value);
  };

 
  async function handleQuerySubmit(query: string, formData?: FormData) {
    setInput(query)
    setIsGenerating(true)

    // Add user message to UI state
    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: generateId(),
        component: <UserMessage message={query} />
      }
    ])

    // Submit and get response message
    const data = formData || new FormData()
    if (!formData) {
      data.append('input', query)
    }
    const responseMessage = await submit(data)
    setMessages(currentMessages => [...currentMessages, responseMessage])
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await handleQuerySubmit(input, formData)
  }

  // if query is not empty, submit the query
  useEffect(() => {
    if (isFirstRender.current && query && query.trim().length > 0) {
      handleQuerySubmit(query)
      isFirstRender.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  useEffect(() => {
    const lastMessage = aiMessage.messages.slice(-1)[0]
    if (lastMessage?.type === 'followup' || lastMessage?.type === 'inquiry') {
      setIsGenerating(false)
    }
  }, [aiMessage, setIsGenerating])

  // Clear messages
  const handleClear = () => {
    setIsGenerating(false)
    setMessages([])
    setAIMessage({ messages: [], chatId: '' })
    setInput('')
    router.push('/')
  }

  useEffect(() => {
    // focus on input when the page loads
    inputRef.current?.focus()
  }, [])

  // If there are messages and the new button has not been pressed, display the new Button
  if (messages.length > 0) {
    return (
      <div className="fixed bottom-2 md:bottom-8 left-0 right-0 flex justify-center items-center mx-auto pointer-events-none">
        <Button
          type="button"
          variant={'secondary'}
          className="rounded-full bg-secondary/80 group transition-all hover:scale-105 pointer-events-auto"
          onClick={() => handleClear()}
          disabled={isGenerating}
        >
          <span className="text-sm mr-2 group-hover:block hidden animate-in fade-in duration-300">
            New
          </span>
          <Plus size={18} className="group-hover:rotate-90 transition-all" />
        </Button>
      </div>
    )
  }

  if (query && query.trim().length > 0) {
    return null
  }


  
const modelHandle=(ModelName: String)=>{
    let newEnvVar;
    if(ModelName =="gpt-4o-mini"){
      newEnvVar = "gpt-4o-mini"
     toast.success(ModelName)
        
    }

    else if(ModelName== "gpt-3.5-turbo"){
      toast.success(ModelName)
      newEnvVar = "gpt-3.5-turbo"
    } 
    else if(ModelName=="gpt-4o"){
      toast.success(ModelName)
      newEnvVar = "gpt-4o"
    }
    else{
      
      let myEnVar = process.env.OPENAI_API_MODEL || 'gpt-4o'
      newEnvVar = "gpt-4o"
    }
  
  SetMyEnvVar(newEnvVar);   
  
}
 

  

  return (
    
    <div
      className={
        'fixed bottom-8 left-0 right-0 top-10 mx-auto h-screen flex flex-col items-center justify-center'
      }
    >
     
      
      
      <form onSubmit={handleSubmit} className="max-w-2xl w-full px-6 top-10">
      <div className={'mt-4 flex flex-col items-start space-y-2 mb-4'}>
        
        <DropdownMenu>
              <DropdownMenuTrigger>
                <div className='flex items-stretch px-0'>
                 
                {selectedValue=="Lighting"? 
                 <IconBrandCodesandbox className='mr-2 h-6 w-7 underline-offset-auto text-blue-700 text-pretty align-text-bottom'/>
                  
                 :null
                }
                
                {selectedValue=="Quality(Claude)"? 
                <IconSparkles className='mr-2 h-6 w-7 text-orange-700'/>
                :null
                }

                {selectedValue=="Quality(GPT)"? 
                 <IconSparkles className='mr-2 h-6 w-7 text-purple-700'/>
                :null}
                
                {selectedValue=="Speed"? 
                <IconPlayerTrackNext className='mr-2 h-4 w-5 mt-1 underline-offset-auto px-0 text-green-400'/>
                 :null }
                <h6><b>{selectedValue}</b></h6>
                </div>
                
              </DropdownMenuTrigger>
              <DropdownMenuContent className='w-60'>
                <center>
                <DropdownMenuLabel>
              
                  </DropdownMenuLabel></center>
                <DropdownMenuSeparator/>
                <DropdownMenuGroup>
                    <div className='flex space-x-1 px-7'>
                     <h5 className=' '><b>Speed</b></h5>
                     <h5><b className='inline-block bg-green-400  text-black font-bold  px-5 rounded-full'> New</b></h5>
                   </div>
                    <DropdownMenuItem onClick={()=> {setSelectedValue("Speed"); modelHandle("gpt-4o-mini")}}>
                      <IconBrandOpenai className='mr-2 h-6 w-7 underline-offset-auto text-green-700 text-pretty align-text-bottom'/>
                      <span className='flex text-gray-500'>High speed,but low quality <br></br>OpenAI/GPT-4o-mini</span>
                      <br></br>
                    </DropdownMenuItem >

                    <div className='flex space-x-1 px-7'>
                     <h5 className=' '><b>Lighting</b></h5>
                     <h5><b className='inline-block bg-green-400  text-black font-bold  px-5 rounded-full'></b></h5>
                   </div>
                    <DropdownMenuItem onClick={()=> {setSelectedValue("Lighting"); modelHandle("gpt-3.5-turbo")}}>
                      <IconBrandCodesandbox className='mr-2 h-6 w-7 underline-offset-auto text-blue-700 text-pretty align-text-bottom'/>
                      <span className='flex text-gray-500'>High speed,but low quality <br></br>OpenAI/GPT-3.5</span>
                      <br></br>
                    </DropdownMenuItem >

                    <div className='flex space-x-1 px-7'>
                    <h5 className='font-bold '>Quality(GPT)</h5>
                    {isSignedIn?
                    <h5><b className='inline-block bg-purple-400  text-black font-bold  px-5 rounded-full'> Pro</b></h5>
                    :<h5><b className='inline-block bg-green-400  text-black font-bold  px-5 rounded-full'> login</b></h5>
                    }
                    </div>
                    <DropdownMenuItem onClick={()=> {setSelectedValue("Quality(GPT)");modelHandle("gpt-4o")}}>
                      <IconSparkles className='mr-2 h-6 w-7 text-purple-700'/>
                      <span className='flex text-gray-500'>High quality generation<br></br> (OpenAI/GPT-4o)</span>
                      
                    </DropdownMenuItem>
                    <div className='flex space-x-1 px-7'>
                    <h6 className='font-bold '>Quality(Claude)</h6>
                    {isSignedIn?
                     <h5><b className='inline-block bg-orange-400  text-black font-bold  px-4 rounded-full'> Pro</b></h5>
                    :<h5><b className='inline-block bg-green-400  text-black font-bold  px-4 rounded-full'> login</b></h5>
                   }
                   </div>
                    <DropdownMenuItem onClick={()=> setSelectedValue("Quality(Claude)")}>
                      <IconSparkles className='mr-2 h-6 w-7 text-orange-700'/>
                      <span className='flex text-gray-500'>High quality generation<br></br>(Claude3.5-Sonnet)</span>
                      
                    </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
          </DropdownMenu>   

        </div>
        <div className="relative flex items-center w-full">
          <Textarea
            ref={inputRef}
            name="input"
            rows={1}
            maxRows={5}
            tabIndex={0}
            placeholder="Ask a question..."
            spellCheck={false}
            value={input}
            className="resize-none w-full min-h-12 rounded-fill bg-muted border border-input pl-4 pr-10 pt-3 pb-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'"
            onChange={e => {
              setInput(e.target.value)
              setShowEmptyScreen(e.target.value.length === 0)
            }}
            onKeyDown={e => {
              // Enter should submit the form
              if (
                e.key === 'Enter' &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing
              ) {
                // Prevent the default action to avoid adding a new line
                if (input.trim().length === 0) {
                  e.preventDefault()
                  return
                }
                e.preventDefault()
                const textarea = e.target as HTMLTextAreaElement
                textarea.form?.requestSubmit()
              }
            }}
            onHeightChange={height => {
              // Ensure inputRef.current is defined
              if (!inputRef.current) return

              // The initial height and left padding is 70px and 2rem
              const initialHeight = 70
              // The initial border radius is 32px
              const initialBorder = 32
              // The height is incremented by multiples of 20px
              const multiple = (height - initialHeight) / 20

              // Decrease the border radius by 4px for each 20px height increase
              const newBorder = initialBorder - 4 * multiple
              // The lowest border radius will be 8px
              inputRef.current.style.borderRadius =
                Math.max(8, newBorder) + 'px'
            }}
            onFocus={() => setShowEmptyScreen(true)}
            onBlur={() => setShowEmptyScreen(false)}
          />
          <Button
            type="submit"
            size={'icon'}
            variant={'ghost'}
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            disabled={input.length === 0}
          >
            <ArrowRight size={20} />
          </Button>
        </div>
        <EmptyScreen
          submitMessage={message => {
            setInput(message)
          }}
          className={cn(showEmptyScreen ? 'visible' : 'invisible')}
        />
      </form>   
       <h6 className='flex bottom-2' ><TextGenerateEffectDemo/></h6>
        
        <a href='/news'>
        <AnimatedTooltipPreview/>
        </a>
        <br></br>
    </div>
  )
}
