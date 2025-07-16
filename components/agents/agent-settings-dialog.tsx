"use client"

import { FC, useContext, useState, useEffect } from "react"
import { ChatbotUIContext } from "@/context/context"
import { AgentConfig, AgentTool } from "@/types/agent"
import { testAgentConnection, getAgentTools } from "@/lib/agent-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { IconCheck, IconX, IconLoader } from "@tabler/icons-react"

interface AgentSettingsDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export const AgentSettingsDialog: FC<AgentSettingsDialogProps> = ({
  isOpen,
  onOpenChange
}) => {
  const {
    agentConfig,
    setAgentConfig,
    agentTools,
    setAgentTools,
    setIsAgentMode,
    setIsAgentConnected
  } = useContext(ChatbotUIContext)

  const [endpoint, setEndpoint] = useState("http://localhost:8000")
  const [apiKey, setApiKey] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "success" | "error"
  >("idle")
  const [tools, setTools] = useState<AgentTool[]>([])

  // Load existing agent config if available
  useEffect(() => {
    if (agentConfig) {
      setEndpoint(agentConfig.endpoint)
      setApiKey(agentConfig.apiKey || "")
      setTools(agentTools)
      setConnectionStatus("success")
    }
  }, [agentConfig, agentTools])

  const handleConnect = async () => {
    setIsConnecting(true)
    setConnectionStatus("idle")

    try {
      // Test connection to the agent API
      const connected = await testAgentConnection({ endpoint, apiKey })

      if (connected) {
        // Fetch available tools from the agent API
        const availableTools = await getAgentTools({ endpoint, apiKey })
        setTools(availableTools)
        setConnectionStatus("success")

        // Save agent config
        const config: AgentConfig = {
          id: "default",
          name: "Default Agent",
          endpoint,
          apiKey: apiKey || undefined,
          timeout: 60000,
          tools: availableTools.filter(t => t.enabled).map(t => t.name)
        }

        setAgentConfig(config)
        setAgentTools(availableTools)
        setIsAgentConnected(true)
      } else {
        setConnectionStatus("error")
      }
    } catch (error) {
      console.error("Agent connection failed:", error)
      setConnectionStatus("error")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleConfirm = () => {
    if (connectionStatus === "success") {
      setIsAgentMode(true)
      onOpenChange(false)
    }
  }

  const handleDisconnect = () => {
    setAgentConfig(null)
    setAgentTools([])
    setIsAgentMode(false)
    setIsAgentConnected(false)
    setConnectionStatus("idle")
    setTools([])
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Agent API Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* API Endpoint */}
          <div className="space-y-2">
            <Label htmlFor="endpoint">API Endpoint</Label>
            <Input
              id="endpoint"
              value={endpoint}
              onChange={e => setEndpoint(e.target.value)}
              placeholder="http://localhost:8000"
              disabled={isConnecting}
            />
          </div>

          {/* API Key (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key (Optional)</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="Your API key"
              disabled={isConnecting}
            />
          </div>

          {/* Connect Button */}
          <Button
            onClick={handleConnect}
            disabled={isConnecting || !endpoint.trim()}
            className="w-full"
          >
            {isConnecting ? (
              <>
                <IconLoader size={16} className="mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              "Test Connection"
            )}
          </Button>

          {/* Connection Status */}
          {connectionStatus === "success" && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
              <div className="flex items-center space-x-2 text-green-700">
                <IconCheck size={16} />
                <span className="font-medium">Connected Successfully!</span>
              </div>
            </div>
          )}

          {connectionStatus === "error" && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <div className="flex items-center space-x-2 text-red-700">
                <IconX size={16} />
                <span className="font-medium">Connection Failed</span>
              </div>
              <p className="mt-1 text-sm text-red-600">
                Please check your endpoint URL and try again.
              </p>
            </div>
          )}

          {/* Available Tools */}
          {tools.length > 0 && (
            <div className="space-y-2">
              <Label>Available Tools</Label>
              <div className="flex flex-wrap gap-2">
                {tools.map(tool => (
                  <Badge key={tool.name} variant="secondary">
                    {tool.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between space-x-2">
            {agentConfig && (
              <Button variant="outline" onClick={handleDisconnect}>
                Disconnect
              </Button>
            )}

            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={connectionStatus !== "success"}
              >
                Use Agent
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
