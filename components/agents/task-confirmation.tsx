import { ChatbotUIContext } from "@/context/context"
import { FC, useContext } from "react"
import { Button } from "../ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "../ui/card"
import { IconCheck, IconX, IconClock, IconList } from "@tabler/icons-react"
import { sendAgentMessage } from "@/lib/agent-api"
import { toast } from "sonner"

interface TaskConfirmationProps {}

export const TaskConfirmation: FC<TaskConfirmationProps> = () => {
  const {
    taskAnalysis,
    setTaskAnalysis,
    showTaskConfirmation,
    setShowTaskConfirmation,
    pendingUserMessage,
    setPendingUserMessage,
    isGenerating,
    setIsGenerating,
    agentConfig,
    chatMessages,
    setChatMessages,
    profile,
    selectedChat
  } = useContext(ChatbotUIContext)

  const handleConfirm = async () => {
    if (!taskAnalysis || !pendingUserMessage || !agentConfig) return

    // Hide confirmation dialog and set generating state
    setShowTaskConfirmation(false)
    setIsGenerating(true)

    try {
      // Add user message to chat
      const userMessage = {
        message: {
          id: Date.now().toString(),
          content: pendingUserMessage,
          role: "user" as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          chat_id: selectedChat?.id || "",
          user_id: profile?.user_id || "",
          sequence_number: chatMessages.length,
          image_paths: []
        },
        fileItems: []
      }

      setChatMessages(prevMessages => [...prevMessages, userMessage])

      // Send task execution request
      const agentResponse = await sendAgentMessage({
        config: agentConfig,
        messages: [taskAnalysis.breakdown_raw, pendingUserMessage],
        files: []
      })

      // Add assistant response
      const assistantMessage = {
        message: {
          id: (Date.now() + 1).toString(),
          content: agentResponse.content,
          role: "assistant" as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          chat_id: selectedChat?.id || "",
          user_id: profile?.user_id || "",
          sequence_number: chatMessages.length + 1,
          image_paths: []
        },
        fileItems: []
      }

      setChatMessages(prevMessages => [...prevMessages, assistantMessage])

      // Handle tool calls
      if (agentResponse.tool_calls && agentResponse.tool_calls.length > 0) {
        console.log("Agent used tools:", agentResponse.tool_calls)
      }
    } catch (error) {
      console.error("Task execution failed:", error)
      toast.error("Failed to execute task. Please try again.")
    } finally {
      // Clean up state
      setTaskAnalysis(null)
      setPendingUserMessage("")
      setIsGenerating(false)
    }
  }

  const handleCancel = () => {
    setShowTaskConfirmation(false)
    setTaskAnalysis(null)
    setPendingUserMessage("")
  }

  if (!showTaskConfirmation || !taskAnalysis) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="mx-4 max-h-[80vh] w-full max-w-2xl overflow-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconList className="size-5" />
            Task breakdown Confirmation
          </CardTitle>
          <CardDescription>
            Please confirm that the following task breakdown is correct, then
            choose to execute or cancel
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Original Message */}
          <div>
            <h4 className="mb-2 text-sm font-medium">Original Request:</h4>
            <div className="bg-muted rounded-lg p-3 text-sm">
              {pendingUserMessage}
            </div>
          </div>

          {/* Task Breakdown */}
          <div>
            <h4 className="mb-2 text-sm font-medium">Task Breakdown:</h4>
            <div className="whitespace-pre-wrap rounded-lg bg-blue-50 p-3 text-sm dark:bg-blue-950">
              {taskAnalysis.breakdown_human_friendly}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            <IconX className="size-4" />
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            <IconCheck className="size-4" />
            {isGenerating ? "Analyzing..." : "Confirmed"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
