# Chatbot UI 项目说明文档

## 项目概述

Chatbot UI 是一个开源的人工智能聊天应用程序，支持多种AI模型提供商，包括OpenAI、Anthropic、Google Gemini、Mistral、Groq、Perplexity等。该项目基于Next.js 14、React 18和TypeScript构建，使用Supabase作为后端数据库和认证服务，支持国际化、PWA功能以及AI代理模式。

### 核心特性
- **多模型支持**: 支持OpenAI GPT系列、Claude、Gemini、Llama等多种大语言模型
- **AI代理模式**: 支持任务分析和自动执行功能
- **文件处理**: 支持PDF、Word、Markdown、CSV、JSON等文件格式上传和处理
- **向量检索**: 支持文档向量化存储和语义检索
- **工具集成**: 支持OpenAPI工具调用和自定义工具
- **多语言支持**: 基于i18next的国际化功能
- **PWA支持**: 可作为渐进式Web应用安装

## 项目架构

### 技术栈
- **前端框架**: Next.js 14 (App Router)
- **UI框架**: React 18
- **类型系统**: TypeScript
- **样式**: Tailwind CSS + Radix UI
- **状态管理**: React Context API
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **存储**: Supabase Storage
- **部署**: Vercel

### 文件夹结构

```
chatbot-ui/
├── app/                      # Next.js App Router 页面
│   ├── [locale]/            # 国际化路由
│   │   ├── layout.tsx       # 根布局
│   │   ├── page.tsx         # 首页
│   │   ├── globals.css      # 全局样式
│   │   ├── [workspaceid]/   # 工作空间页面
│   │   ├── help/            # 帮助页面
│   │   ├── login/           # 登录页面
│   │   └── setup/           # 初始设置页面
│   ├── api/                 # API 路由
│   │   ├── chat/            # 聊天API (各种模型提供商)
│   │   ├── retrieval/       # 文档检索API
│   │   ├── command/         # 命令处理API
│   │   └── username/        # 用户名相关API
│   └── auth/                # 认证回调
├── components/              # React组件
│   ├── agents/              # AI代理相关组件
│   ├── chat/                # 聊天界面组件
│   ├── icons/               # 图标组件
│   ├── messages/            # 消息显示组件
│   ├── models/              # 模型相关组件
│   ├── setup/               # 设置向导组件
│   ├── sidebar/             # 侧边栏组件
│   ├── ui/                  # 基础UI组件
│   ├── utility/             # 工具组件
│   └── workspace/           # 工作空间组件
├── context/                 # React Context
├── db/                      # 数据库操作
├── lib/                     # 工具库
├── public/                  # 静态资源
├── supabase/                # Supabase配置和类型
├── types/                   # TypeScript类型定义
└── worker/                  # Service Worker
```

## 核心组件详解

### 1. 应用入口和布局 (app/[locale]/layout.tsx)

**功能**:
- 根布局组件，处理应用的基础结构
- 集成国际化、主题提供者、全局状态管理
- 处理用户认证状态
- 配置PWA元数据

**主要特性**:
- 支持多语言 (i18next)
- 暗色主题支持
- PWA配置 (manifest.json, 图标等)
- Supabase认证集成
- 全局状态管理器包装

### 2. 全局状态管理 (context/context.tsx & components/utility/global-state.tsx)

**ChatbotUIContext** 包含以下状态类别:

#### 用户资料存储 (Profile Store)
- `profile`: 用户配置信息
- `setProfile`: 更新用户配置

#### 数据项存储 (Items Store)
- `assistants`: AI助手列表
- `collections`: 文档集合
- `chats`: 聊天记录
- `files`: 文件列表
- `folders`: 文件夹组织
- `models`: 自定义模型
- `presets`: 预设配置
- `prompts`: 提示词模板
- `tools`: 工具配置
- `workspaces`: 工作空间

#### 模型存储 (Models Store)
- `envKeyMap`: 环境变量键映射
- `availableHostedModels`: 托管模型列表
- `availableLocalModels`: 本地模型 (Ollama)
- `availableOpenRouterModels`: OpenRouter模型

#### 工作空间存储 (Workspace Store)
- `selectedWorkspace`: 当前选中的工作空间
- `workspaceImages`: 工作空间图片

#### 聊天状态存储 (Chat Store)
- `userInput`: 用户输入
- `chatMessages`: 聊天消息列表
- `chatSettings`: 聊天配置 (模型、温度、上下文长度等)
- `selectedChat`: 当前聊天
- `isGenerating`: 是否正在生成回复
- `abortController`: 请求取消控制器

#### 附件存储 (Attachments Store)
- `chatFiles`: 聊天文件
- `chatImages`: 聊天图片
- `newMessageFiles`: 新消息文件
- `newMessageImages`: 新消息图片

#### 检索存储 (Retrieval Store)
- `useRetrieval`: 是否启用文档检索
- `sourceCount`: 检索源数量

#### 工具存储 (Tool Store)
- `selectedTools`: 选中的工具
- `toolInUse`: 当前使用的工具

#### AI代理存储 (Agent Store)
- `agentConfig`: 代理配置
- `agentTools`: 代理工具
- `isAgentMode`: 是否启用代理模式
- `isAgentConnected`: 代理连接状态
- `taskAnalysis`: 任务分析结果
- `isAnalyzing`: 是否正在分析任务

### 3. 聊天界面 (components/chat/*)

#### 主聊天组件 (chat-ui.tsx)
**功能**:
- 聊天界面的主容器
- 处理聊天数据加载
- 管理消息和文件项的同步

#### 聊天输入 (chat-input.tsx)
**功能**:
- 用户消息输入框
- 支持多种命令模式:
  - `@` : 选择助手
  - `/` : 选择提示词
  - `#` : 选择文件
  - `!` : 选择工具
- 文件拖放上传
- AI代理模式任务输入

#### 聊天消息 (chat-messages.tsx)
**功能**:
- 显示聊天消息列表
- 支持消息编辑和重新生成
- 文件项显示

#### 聊天处理逻辑 (chat-hooks/use-chat-handler.tsx)
**核心功能**:
- `handleSendMessage`: 发送消息主逻辑
  - 验证聊天设置
  - 处理文件检索
  - 选择合适的模型提供商
  - 处理工具调用
  - 管理流式响应
- `handleNewChat`: 创建新聊天
- `handleStopMessage`: 停止消息生成
- `handleSendEdit`: 编辑消息

### 4. 消息组件 (components/messages/*)

#### 消息显示 (message.tsx)
**功能**:
- 单条消息的渲染
- 支持Markdown格式
- 文件预览
- 消息操作 (复制、编辑、重新生成)

#### 消息操作 (message-actions.tsx)
**功能**:
- 消息交互按钮
- 复制消息内容
- 编辑消息
- 重新生成响应

### 5. 侧边栏 (components/sidebar/*)

#### 主侧边栏 (sidebar.tsx)
**功能**:
- 工作空间切换
- 数据项分类展示 (聊天、文件、助手等)
- 搜索和过滤功能

#### 数据列表 (sidebar-data-list.tsx)
**功能**:
- 通用数据项列表组件
- 支持拖拽排序
- 文件夹组织
- 批量操作

#### 各类数据项组件
- `chat-item.tsx`: 聊天项
- `file-item.tsx`: 文件项
- `assistant-item.tsx`: 助手项
- `collection-item.tsx`: 集合项
- `tool-item.tsx`: 工具项

### 6. AI代理系统 (components/agents/*)

#### 代理设置对话框 (agent-settings-dialog.tsx)
**功能**:
- 配置代理API端点
- 测试连接
- 获取可用工具列表
- 管理代理配置

#### 任务确认 (task-confirmation.tsx)
**功能**:
- 显示任务分析结果
- 确认任务执行
- 显示预估时间
- 处理任务执行

### 7. 设置向导 (components/setup/*)

#### 设置容器 (step-container.tsx)
**功能**:
- 多步设置向导框架
- 导航控制
- 步骤指示

#### 各设置步骤
- `profile-step.tsx`: 用户资料设置
- `api-step.tsx`: API密钥配置
- `finish-step.tsx`: 完成设置

### 8. UI组件库 (components/ui/*)

基于Radix UI和Tailwind CSS构建的通用组件:

- `button.tsx`: 按钮组件
- `input.tsx`: 输入框组件
- `dialog.tsx`: 对话框组件
- `dropdown-menu.tsx`: 下拉菜单
- `tabs.tsx`: 标签页组件
- `scroll-area.tsx`: 滚动区域
- `sheet.tsx`: 侧边抽屉
- `toast.tsx`: 通知组件
- `form.tsx`: 表单组件
- `table.tsx`: 表格组件
- `card.tsx`: 卡片组件
- `avatar.tsx`: 头像组件
- `badge.tsx`: 徽章组件
- `separator.tsx`: 分割线
- `skeleton.tsx`: 骨架屏
- `slider.tsx`: 滑块组件
- `switch.tsx`: 开关组件
- `radio-group.tsx`: 单选组
- `command.tsx`: 命令面板

## 数据库架构 (supabase/types.ts)

### 核心表结构

#### 用户和认证
- `profiles`: 用户配置信息
  - API密钥存储
  - 用户偏好设置
  - 头像和个人信息

#### 工作空间系统
- `workspaces`: 工作空间
  - 默认模型设置
  - 工作空间说明
  - 嵌入提供商配置

#### 聊天系统
- `chats`: 聊天记录
  - 关联助手和工作空间
  - 聊天配置参数
- `messages`: 消息内容
  - 用户和助手消息
  - 图片路径存储
  - 序列号排序

#### 文件系统
- `files`: 文件信息
  - 文件元数据
  - 令牌数量
  - 文件类型
- `file_items`: 文件内容块
  - 向量嵌入存储
  - 内容分块
- `file_workspaces`: 文件-工作空间关联

#### AI助手系统
- `assistants`: AI助手定义
  - 提示词模板
  - 模型配置
  - 上下文设置
- `assistant_files`: 助手-文件关联
- `assistant_tools`: 助手-工具关联
- `assistant_collections`: 助手-集合关联

#### 工具系统
- `tools`: 工具定义
  - OpenAPI架构
  - 自定义请求头
  - 工具描述
- `tool_workspaces`: 工具-工作空间关联

#### 集合系统
- `collections`: 文档集合
  - 集合描述
  - 文件组织
- `collection_files`: 集合-文件关联

#### 预设和提示词
- `presets`: 聊天预设
  - 模型参数配置
  - 预设模板
- `prompts`: 提示词模板
  - 可重用提示词
- `models`: 自定义模型
  - 自定义API配置

### 关系型设计
- 所有表都与用户ID关联，支持多租户
- 工作空间作为数据隔离边界
- 支持数据共享和权限控制

## API路由架构 (app/api/*)

### 聊天API (/api/chat/*)

#### 多模型提供商支持
- `openai/`: OpenAI GPT模型
- `anthropic/`: Anthropic Claude模型  
- `google/`: Google Gemini模型
- `mistral/`: Mistral AI模型
- `groq/`: Groq模型
- `perplexity/`: Perplexity模型
- `openrouter/`: OpenRouter聚合模型
- `azure/`: Azure OpenAI模型
- `custom/`: 自定义模型API

#### 工具调用API (/api/chat/tools/)
**功能**:
- OpenAPI架构解析
- 动态工具函数生成
- 工具调用执行
- 结果流式返回

### 文档检索API (/api/retrieval/*)

#### 文档处理 (/api/retrieval/process/)
**功能**:
- 多格式文件处理 (PDF, Word, Markdown等)
- 文本分块
- 向量嵌入生成
- 数据库存储

#### 语义检索 (/api/retrieval/retrieve/)
**功能**:
- 用户查询向量化
- 相似度搜索
- 上下文相关内容返回
- 支持OpenAI和本地嵌入

### 用户管理API (/api/username/*)

- `available/`: 检查用户名可用性
- `get/`: 获取用户信息

### 认证API (/app/auth/*)

- `callback/`: OAuth回调处理
- 集成Supabase Auth

## 数据库操作层 (db/*)

### 核心数据操作模块

#### 聊天操作 (chats.ts)
- `getChatById`: 获取聊天详情
- `getChatsByWorkspaceId`: 获取工作空间聊天
- `createChat`: 创建新聊天
- `updateChat`: 更新聊天
- `deleteChat`: 删除聊天

#### 消息操作 (messages.ts)
- `getMessagesByChatId`: 获取聊天消息
- `createMessages`: 批量创建消息
- `updateMessage`: 更新消息
- `deleteMessagesIncludingAndAfter`: 删除消息及之后内容

#### 文件操作 (files.ts)
- `getFileById`: 获取文件详情
- `createFile`: 创建文件记录
- `uploadFile`: 文件上传处理
- `processFile`: 文件内容处理
- 支持多种文件格式处理

#### 助手操作 (assistants.ts)
- `getAssistantById`: 获取助手详情
- `createAssistant`: 创建助手
- `updateAssistant`: 更新助手配置
- 助手文件和工具关联管理

#### 工具操作 (tools.ts)
- `getToolById`: 获取工具详情
- `createTool`: 创建工具
- `updateTool`: 更新工具配置
- 工具工作空间关联管理

#### 存储操作 (storage/*)
- `message-images.ts`: 消息图片存储
- `assistant-images.ts`: 助手头像存储
- `workspace-images.ts`: 工作空间图片存储
- `files.ts`: 文件存储管理

## 工具库 (lib/*)

### 核心工具模块

#### 聊天构建 (build-prompt.ts)
**功能**:
- 构建最终聊天消息
- 处理系统提示词
- 适配不同模型格式
- 图片消息处理

#### 模型管理 (models/*)
- `llm-list.ts`: 支持的模型列表
- `fetch-models.ts`: 动态获取模型
- 模型兼容性处理

#### 文档检索 (retrieval/*)
- `processing.ts`: 文档处理逻辑
  - PDF解析
  - Word文档处理
  - Markdown解析
  - CSV/JSON处理

#### OpenAPI转换 (openapi-conversion.ts)
**功能**:
- OpenAPI架构解析
- 函数定义生成
- 路由映射创建
- 参数验证

#### AI代理API (agent-api.ts)
**功能**:
- `analyzeTask`: 任务分析
- `sendAgentMessage`: 发送代理消息
- `testAgentConnection`: 测试连接
- `getAgentTools`: 获取工具列表

#### 服务端工具 (server/*)
- `server-chat-helpers.ts`: 服务端聊天辅助
  - API密钥验证
  - 用户配置获取
  - 错误处理

#### 嵌入生成 (generate-local-embedding.ts)
**功能**:
- 本地向量嵌入生成
- 模型管理
- 性能优化

### 工具钩子 (hooks/*)
- `use-hotkey.ts`: 快捷键支持
- `use-mobile.ts`: 移动端检测

## 类型定义 (types/*)

### 核心类型

#### 聊天类型 (chat.ts)
```typescript
interface ChatSettings {
  model: LLMID
  prompt: string
  temperature: number
  contextLength: number
  includeProfileContext: boolean
  includeWorkspaceInstructions: boolean
  embeddingsProvider: "openai" | "local"
}
```

#### 消息类型 (chat-message.ts)
```typescript
interface ChatMessage {
  message: Tables<"messages">
  fileItems: string[]
}
```

#### AI代理类型 (agent.ts)
```typescript
interface AgentConfig {
  id: string
  name: string
  endpoint: string
  apiKey?: string
  timeout: number
  tools: string[]
}
```

#### 模型类型 (llms.ts)
```typescript
interface LLM {
  modelId: LLMID
  modelName: string
  provider: ModelProvider
  hostedId: string
  platformLink: string
  imageInput: boolean
}
```

## 国际化支持 (lib/i18n.ts)

### 功能特性
- 基于next-i18n-router的路由级国际化
- 支持多语言切换
- 翻译资源懒加载
- 服务端和客户端渲染支持

### 配置文件
- `i18nConfig.js`: 国际化配置
- `public/locales/`: 翻译文件存储

## 中间件 (middleware.ts)

### 功能
- 国际化路由处理
- 用户认证检查
- 自动重定向到首页工作空间
- 请求预处理

## PWA支持

### 配置文件
- `public/manifest.json`: PWA清单
- `worker/index.js`: Service Worker
- `next.config.js`: PWA配置

### 功能
- 离线支持
- 应用安装
- 推送通知 (可扩展)
- 自动更新

## 主要功能流程

### 1. 用户注册和设置流程
1. 用户通过Supabase Auth注册/登录
2. 首次登录重定向到设置页面 (/setup)
3. 完成用户资料设置
4. 配置API密钥 (可选)
5. 创建默认工作空间
6. 重定向到聊天界面

### 2. 聊天消息处理流程
1. 用户在chat-input中输入消息
2. useChatHandler处理消息发送
3. 验证聊天设置和用户权限
4. 如启用检索，执行文档检索
5. 构建消息上下文
6. 根据模型选择对应API路由
7. 处理工具调用 (如有)
8. 流式返回AI响应
9. 更新聊天记录和消息

### 3. 文件上传和处理流程
1. 用户拖拽或选择文件
2. 验证文件类型和大小
3. 上传到Supabase Storage
4. 后台处理文件内容:
   - 文本提取
   - 内容分块
   - 向量嵌入生成
5. 存储到数据库
6. 关联到工作空间/集合

### 4. AI代理任务执行流程
1. 用户启用代理模式
2. 输入任务描述
3. 调用analyzeTask分析任务
4. 显示任务分解和确认对话框
5. 用户确认后执行任务
6. 代理API处理任务执行
7. 返回执行结果

### 5. 工具调用流程
1. 用户选择工具并发送消息
2. OpenAI API处理工具调用请求
3. 解析工具调用参数
4. 根据OpenAPI架构构建请求
5. 调用外部API
6. 返回工具执行结果
7. AI模型处理结果并生成回复

## 安全特性

### 1. 认证和授权
- Supabase Row Level Security (RLS)
- 基于用户ID的数据隔离
- API密钥加密存储
- 会话管理

### 2. 数据保护
- 环境变量敏感信息存储
- API密钥验证和错误处理
- 输入验证和清理
- CORS配置

### 3. 存储安全
- 文件上传类型限制
- 存储桶访问控制
- 用户文件隔离

## 性能优化

### 1. 前端优化
- Next.js App Router优化
- 代码分割和懒加载
- 图片优化
- 缓存策略

### 2. 数据库优化
- 索引优化
- 查询优化
- 连接池管理
- 向量查询优化

### 3. API优化
- 流式响应
- 请求缓存
- 错误重试机制
- 连接复用

## 扩展性设计

### 1. 模块化架构
- 组件化设计
- 松耦合模块
- 插件化工具系统
- 可配置的模型提供商

### 2. 可扩展功能
- 自定义模型集成
- 新工具类型支持
- 额外文件格式处理
- 第三方服务集成

### 3. 部署灵活性
- Docker容器化支持
- 多环境配置
- 水平扩展支持
- 微服务架构兼容

## 开发和部署

### 开发环境设置
1. 克隆项目: `git clone https://github.com/mckaywrigley/chatbot-ui.git`
2. 安装依赖: `npm install`
3. 配置环境变量: 复制`.env.local.example`到`.env.local`
4. 启动Supabase: `supabase start`
5. 运行开发服务器: `npm run dev`

### 生产部署
1. 配置Supabase生产环境
2. 设置环境变量
3. 构建应用: `npm run build`
4. 部署到Vercel或其他平台

### 数据库迁移
- `npm run db-migrate`: 应用数据库迁移
- `npm run db-types`: 生成TypeScript类型
- `npm run db-reset`: 重置数据库

## 总结

Chatbot UI是一个功能完整、架构清晰的现代化AI聊天应用。它通过模块化设计、类型安全、性能优化和安全考虑，提供了一个可扩展、可维护的AI聊天解决方案。项目支持多种AI模型、文档处理、工具集成和AI代理功能，是学习和开发AI应用的优秀参考项目。

主要技术亮点:
- 现代化的React/Next.js架构
- 完整的TypeScript类型系统
- 灵活的状态管理
- 强大的文档处理能力
- 多模型提供商支持
- AI代理和工具集成
- 国际化和PWA支持
- 安全的数据管理

该项目展示了如何构建一个生产级别的AI聊天应用，涵盖了从前端UI到后端API、从数据库设计到部署优化的完整技术栈。
