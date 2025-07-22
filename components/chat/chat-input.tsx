import { ChatbotUIContext } from "@/context/context"
import useHotkey from "@/lib/hooks/use-hotkey"
import { LLM_LIST } from "@/lib/models/llm/llm-list"
import { cn } from "@/lib/utils"
import {
  IconBolt,
  IconCirclePlus,
  IconPlayerStopFilled,
  IconSend,
  IconRobotFace
} from "@tabler/icons-react"
import Image from "next/image"
import { FC, useContext, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { Input } from "../ui/input"
import { TextareaAutosize } from "../ui/textarea-autosize"
import { ChatCommandInput } from "./chat-command-input"
import { ChatFilesDisplay } from "./chat-files-display"
import { useChatHandler } from "./chat-hooks/use-chat-handler"
import { useChatHistoryHandler } from "./chat-hooks/use-chat-history"
import { usePromptAndCommand } from "./chat-hooks/use-prompt-and-command"
import { useSelectFileHandler } from "./chat-hooks/use-select-file-handler"
import { sendAgentMessage, analyzeTask } from "@/lib/agent-api"
import { TaskConfirmation } from "../agents/task-confirmation"

interface ChatInputProps {}

export const ChatInput: FC<ChatInputProps> = ({}) => {
  const { t } = useTranslation()

  useHotkey("l", () => {
    handleFocusChatInput()
  })

  const [isTyping, setIsTyping] = useState<boolean>(false)

  const {
    isAssistantPickerOpen,
    focusAssistant,
    setFocusAssistant,
    userInput,
    chatMessages,
    isGenerating,
    selectedPreset,
    selectedAssistant,
    focusPrompt,
    setFocusPrompt,
    focusFile,
    focusTool,
    setFocusTool,
    isToolPickerOpen,
    isPromptPickerOpen,
    setIsPromptPickerOpen,
    isFilePickerOpen,
    setFocusFile,
    chatSettings,
    selectedTools,
    setSelectedTools,
    assistantImages,
    isAgentMode,
    agentConfig,
    agentTools,
    setUserInput,
    setChatMessages,
    setIsGenerating,
    profile,
    selectedChat,
    taskAnalysis,
    setTaskAnalysis,
    isAnalyzing,
    setIsAnalyzing,
    pendingUserMessage,
    setPendingUserMessage,
    showTaskConfirmation,
    setShowTaskConfirmation
  } = useContext(ChatbotUIContext)

  const {
    chatInputRef,
    handleSendMessage,
    handleStopMessage,
    handleFocusChatInput
  } = useChatHandler()

  const { handleInputChange } = usePromptAndCommand()

  const { filesToAccept, handleSelectDeviceFile } = useSelectFileHandler()

  const {
    setNewMessageContentToNextUserMessage,
    setNewMessageContentToPreviousUserMessage
  } = useChatHistoryHandler()

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setTimeout(() => {
      handleFocusChatInput()
    }, 200) // FIX: hacky
  }, [selectedPreset, selectedAssistant])

  const handleSendClick = async () => {
    if (!userInput.trim()) return

    // If agent mode is enabled, send the message to the agent API
    if (isAgentMode && agentConfig) {
      await handleAgentMessage()
    } else {
      // Regular chat message handling
      await handleSendMessage(userInput, chatMessages, false)
    }
  }

  // Handle analyzing task and showing confirmation dialog
  const handleAgentMessage = async () => {
    if (!agentConfig || !userInput.trim()) return

    const messageContent = userInput.trim()
    setUserInput("")
    setIsAnalyzing(true)

    try {
      // Analyze task
      const analysis = await analyzeTask(agentConfig, messageContent)

      // Set task analysis and pending user message
      setTaskAnalysis(analysis)
      setPendingUserMessage(messageContent)
      setShowTaskConfirmation(true)
    } catch (error) {
      console.error("Task analysis failed:", error)
      toast.error("Failed to analyze task. Please check your connection.")
      setUserInput(messageContent)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isTyping && event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      setIsPromptPickerOpen(false)
      // handleSendMessage(userInput, chatMessages, false)
      handleSendClick()
    }

    // Consolidate conditions to avoid TypeScript error
    if (
      isPromptPickerOpen ||
      isFilePickerOpen ||
      isToolPickerOpen ||
      isAssistantPickerOpen
    ) {
      if (
        event.key === "Tab" ||
        event.key === "ArrowUp" ||
        event.key === "ArrowDown"
      ) {
        event.preventDefault()
        // Toggle focus based on picker type
        if (isPromptPickerOpen) setFocusPrompt(!focusPrompt)
        if (isFilePickerOpen) setFocusFile(!focusFile)
        if (isToolPickerOpen) setFocusTool(!focusTool)
        if (isAssistantPickerOpen) setFocusAssistant(!focusAssistant)
      }
    }

    if (event.key === "ArrowUp" && event.shiftKey && event.ctrlKey) {
      event.preventDefault()
      setNewMessageContentToPreviousUserMessage()
    }

    if (event.key === "ArrowDown" && event.shiftKey && event.ctrlKey) {
      event.preventDefault()
      setNewMessageContentToNextUserMessage()
    }

    //use shift+ctrl+up and shift+ctrl+down to navigate through chat history
    if (event.key === "ArrowUp" && event.shiftKey && event.ctrlKey) {
      event.preventDefault()
      setNewMessageContentToPreviousUserMessage()
    }

    if (event.key === "ArrowDown" && event.shiftKey && event.ctrlKey) {
      event.preventDefault()
      setNewMessageContentToNextUserMessage()
    }

    if (
      isAssistantPickerOpen &&
      (event.key === "Tab" ||
        event.key === "ArrowUp" ||
        event.key === "ArrowDown")
    ) {
      event.preventDefault()
      setFocusAssistant(!focusAssistant)
    }
  }

  const handlePaste = (event: React.ClipboardEvent) => {
    const imagesAllowed = LLM_LIST.find(
      llm => llm.modelId === chatSettings?.model
    )?.imageInput

    const items = event.clipboardData.items
    for (const item of items) {
      if (item.type.indexOf("image") === 0) {
        if (!imagesAllowed) {
          toast.error(
            `Images are not supported for this model. Use models like GPT-4 Vision instead.`
          )
          return
        }
        const file = item.getAsFile()
        if (!file) return
        handleSelectDeviceFile(file)
      }
    }
  }

  // Modify the input to prevent sending immediately
  const isSendDisabled = () => {
    if (!userInput.trim()) return true
    if (isAgentMode && !agentConfig) return true
    if (isGenerating || isAnalyzing) return true
    return false
  }

  // Modify the placeholder text
  const getPlaceholderText = () => {
    if (isAnalyzing) return "Analyzing..."
    if (isGenerating) return "Executing..."
    if (isAgentMode)
      return "Enter the task description and AI will break down the execution steps for you"
    return t(`Ask anything. Type @  /  #  !`)
  }

  return (
    <>
      {/* Task Confirmation Modal */}
      <TaskConfirmation />

      <div className="flex flex-col flex-wrap justify-center gap-2">
        <ChatFilesDisplay />

        {selectedTools &&
          selectedTools.map((tool, index) => (
            <div
              key={index}
              className="flex justify-center"
              onClick={() =>
                setSelectedTools(
                  selectedTools.filter(
                    selectedTool => selectedTool.id !== tool.id
                  )
                )
              }
            >
              <div className="flex cursor-pointer items-center justify-center space-x-1 rounded-lg bg-purple-600 px-3 py-1 hover:opacity-50">
                <IconBolt size={20} />
                <div>{tool.name}</div>
              </div>
            </div>
          ))}

        {selectedAssistant && (
          <div className="border-primary mx-auto flex w-fit items-center space-x-2 rounded-lg border p-1.5">
            {selectedAssistant.image_path && (
              <Image
                className="rounded"
                src={
                  assistantImages.find(
                    img => img.path === selectedAssistant.image_path
                  )?.base64
                }
                width={28}
                height={28}
                alt={selectedAssistant.name}
              />
            )}

            <div className="text-sm font-bold">
              Talking to {selectedAssistant.name}
            </div>
          </div>
        )}

        {/* Agent Mode Status Display */}
        {isAgentMode && agentConfig && (
          <div className="mx-auto flex w-fit items-center space-x-2 rounded-lg border border-blue-500 bg-blue-50 p-1.5 dark:bg-blue-950">
            <IconRobotFace size={20} className="text-blue-600" />
            <div className="text-sm font-bold text-blue-700 dark:text-blue-300">
              {isAnalyzing ? "Analyzing..." : "Agent Mode Active"}
            </div>
            {agentTools.length > 0 && (
              <div className="text-xs text-blue-600 dark:text-blue-400">
                ({agentTools.filter(t => t.enabled).length} tools)
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-input relative mt-3 flex min-h-[60px] w-full items-center justify-center rounded-xl border-2">
        <div className="absolute bottom-[76px] left-0 max-h-[300px] w-full overflow-auto rounded-xl dark:border-none">
          <ChatCommandInput />
        </div>

        <>
          <IconCirclePlus
            className="absolute bottom-[12px] left-3 cursor-pointer p-1 hover:opacity-50"
            size={32}
            onClick={() => fileInputRef.current?.click()}
          />

          {/* Hidden input to select files from device */}
          <Input
            ref={fileInputRef}
            className="hidden"
            type="file"
            onChange={e => {
              if (!e.target.files) return
              handleSelectDeviceFile(e.target.files[0])
            }}
            accept={filesToAccept}
          />
        </>

        <TextareaAutosize
          textareaRef={chatInputRef}
          className="ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring text-md flex w-full resize-none rounded-md border-none bg-transparent px-14 py-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          placeholder={getPlaceholderText()}
          onValueChange={handleInputChange}
          value={userInput}
          minRows={1}
          maxRows={18}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onCompositionStart={() => setIsTyping(true)}
          onCompositionEnd={() => setIsTyping(false)}
          disabled={isAnalyzing || isGenerating}
        />

        <div className="absolute bottom-[14px] right-3 cursor-pointer hover:opacity-50">
          {isGenerating ? (
            <IconPlayerStopFilled
              className="hover:bg-background animate-pulse rounded bg-transparent p-1"
              onClick={handleStopMessage}
              size={30}
            />
          ) : isAnalyzing ? (
            <div className="flex items-center justify-center rounded bg-blue-500 p-1 text-white">
              <div className="size-4 animate-spin rounded-full border-b-2 border-white"></div>
            </div>
          ) : (
            <IconSend
              className={cn(
                "bg-primary text-secondary rounded p-1",
                isSendDisabled() && "cursor-not-allowed opacity-50"
              )}
              onClick={() => {
                if (isSendDisabled()) return
                handleSendClick()
              }}
              size={30}
            />
          )}
        </div>
      </div>
    </>
  )
}
