import {
  AgentConfig,
  AgentTool,
  AgentResponse,
  AgentMessage,
  TaskAnalysisResponse
} from "@/types/agent"

interface ConnectionConfig {
  endpoint: string
  apiKey?: string
  tools?: string[]
  timeout: number
}

export const testAgentConnection = async (
  config: ConnectionConfig
): Promise<boolean> => {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    }

    if (config.apiKey) {
      headers["Authorization"] = `Bearer ${config.apiKey}`
    }

    const response = await fetch(`${config.endpoint}/health`, {
      method: "GET",
      headers,
      signal: AbortSignal.timeout(10000)
    })

    return response.ok
  } catch (error) {
    console.error("Agent connection test failed:", error)
    return false
  }
}

export const getAgentTools = async (
  config: ConnectionConfig
): Promise<AgentTool[]> => {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    }

    if (config.apiKey) {
      headers["Authorization"] = `Bearer ${config.apiKey}`
    }

    const response = await fetch(`${config.endpoint}/tools`, {
      method: "GET",
      headers,
      signal: AbortSignal.timeout(10000)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    return data.tools || []
  } catch (error) {
    console.error("Failed to get agent tools:", error)
    return []
  }
}

export const analyzeTask = async (
  config: ConnectionConfig,
  message: string
): Promise<TaskAnalysisResponse> => {
  try {
    // console.log(`${config.endpoint}/analysis`)
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    }

    if (config.apiKey) {
      headers["Authorization"] = `Bearer ${config.apiKey}`
    }

    const response = await fetch(`${config.endpoint}/analysis`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        message: message,
        tools: config.tools
      }),
      signal: AbortSignal.timeout(config.timeout)
    })

    if (!response.ok) {
      throw new Error(`Analysis API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Task analysis failed:", error)
    throw error
  }
}

export const sendAgentMessage = async (
  message: AgentMessage
): Promise<AgentResponse> => {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    }

    if (message.config.apiKey) {
      headers["Authorization"] = `Bearer ${message.config.apiKey}`
    }

    const response = await fetch(`${message.config.endpoint}/chat`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        messages: message.messages,
        tools: message.config.tools,
        stream: message.stream || false
        // files: message.files // If you need to upload files
      }),
      signal: AbortSignal.timeout(message.config.timeout)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      content: data.response || data.message || "No response",
      tool_calls: data.tool_calls,
      metadata: data.metadata
    }
  } catch (error) {
    console.error("Agent message failed:", error)
    throw error
  }
}
