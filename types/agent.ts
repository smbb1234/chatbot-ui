export interface AgentConfig {
  id: string
  name: string
  endpoint: string
  apiKey?: string
  timeout: number
  tools: string[]
}

export interface AgentTool {
  name: string
  description: string
}

export interface AgentResponse {
  content: string
  tool_calls?: any[]
  metadata?: any
}

export interface AgentMessage {
  config: AgentConfig
  message: string
  files?: File[]
}
