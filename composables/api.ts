/**
 * API 配置
 */
const API_BASE_URL = 'http://localhost:8000/api'

export interface MemorySolveData {
  parsed: {
    question: string
    answerText: string
    answerLines: string[]
    raw: string
  }
  type: 'sequence_list' | 'numbered_list' | 'concept_definition' | 'compare_contrast' | 'number_or_code' | 'general'
  typeLabel: string
  method: 'link_method' | 'peg_method' | 'analogy_method' | 'contrast_matrix_method' | 'chunk_and_encode_method'
  methodLabel: string
  resultBlocks: {
    meta: {
      typeLabel: string
      methodLabel: string
    }
    keywords: string[]
    imagery: string[]
    recap: string
  }
  resultText: string
}

export interface MemoryDraft {
  contentType: string
  hookSystem: string
  memoryMethod: string
  keywords: string[]
  imagery: string[]
  recap: string
  contrastMatrix?: {
    titleA?: string
    titleB?: string
    titleCommon?: string
    a: string[]
    b: string[]
    common: string[]
    scenes?: string[]
    question?: string
  } | null
}

export interface MemoryCard {
  id: string
  front: string
  back: string
  question: string
  answer: string
  keywords: string[]
  imagery: string[]
  recap: string
  strategySummary: {
    primaryMethod: string
    secondaryMethods: string[]
    hookSystem: string
    qualityScore?: number | null
    summaryText: string
  }
  cardFormat: {
    standard: {
      front: string
      back: string
    }
    ankiText: string
    structured: Record<string, unknown>
  }
}

export interface MemoryStrategyAnchor {
  index: number
  source: string
  visual: string
  hook?: string | null
  functionHint?: string | null
  abstractLevel?: string | null
}

export interface MemoryStrategyIR {
  version: string
  task: {
    question: string
    rawAnswerLines: string[]
  }
  analysis: {
    contentType: string
    memoryGoal: string
    difficulty: string
    reason: string
  }
  strategy: {
    primaryMethod: string
    secondaryMethods: string[]
    hookPolicy: {
      useHooks: boolean
      hookSystem: string
      hookPurpose: string
    }
  }
  anchors: MemoryStrategyAnchor[]
  outputPolicy: {
    keywordCount: number
    imagerySentenceCount: number
    recapStyle: string
    tone: string
    allowAbstractWords: boolean
  }
  quality?: {
    qualityScore: number
    issues: string[]
    suggestions: string[]
    autoFixApplied: string[]
  }
}

export interface MemoryChatResponse {
  sessionId: string
  replyType: 'chat' | 'memory_draft' | 'memory_revision' | 'memory_card' | 'draft' | 'question' | 'revision' | 'final_card'
  replyText: string
  mode?: 'general_chat' | 'memory_flow'
  triggeredBy?: 'qa_pair' | 'memory_intent' | 'manual_revision' | 'finalize' | null
  degraded?: boolean
  degradeReason?: 'llm_timeout' | 'invalid_llm_payload' | 'fallback_rule_engine' | 'none' | null
  draft?: MemoryDraft
  finalCard?: MemoryCard
  strategyIr?: MemoryStrategyIR
}

/**
 * 调用 AI 分析接口
 */
export async function analyzeMemory(title: string, content: string) {
  try {
    const response = await $fetch(`${API_BASE_URL}/ai/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        title,
        content,
      },
    })
    return response
  } catch (error) {
    console.error('AI 分析失败:', error)
    throw error
  }
}

/**
 * 调用 AI 问答接口
 */
export async function askQuestion(question: string, memoryId?: number) {
  try {
    const response = await $fetch(`${API_BASE_URL}/ai/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        question,
        memory_id: memoryId,
      },
    })
    return response
  } catch (error) {
    console.error('AI 问答失败:', error)
    throw error
  }
}

/**
 * 调用 AI 聊天接口（通用对话）
 */
export async function chatWithAI(messages: Array<{ role: 'user' | 'assistant', content: string }>) {
  const latestUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content ?? ''

  try {
    // Prefer GET for compatibility with older backend instances.
    const response = await $fetch<{ reply?: string, answer?: string }>(
      `${API_BASE_URL}/ai/chat?prompt=${encodeURIComponent(latestUserMessage)}`,
      { method: 'GET' }
    )
    return response
  } catch (error) {
    const status = (error as { response?: { status?: number } })?.response?.status
    if (status === 404 || status === 405) {
      const fallback = await $fetch<{ reply?: string, answer?: string }>(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          messages,
        },
      })
      return fallback
    }
    console.error('AI 聊天失败:', error)
    throw error
  }
}

/**
 * 调用 Memory Engine 接口
 */
export async function solveMemory(rawText: string) {
  const response = await $fetch<{ ok: boolean, data?: MemorySolveData, message?: string }>(`${API_BASE_URL}/memory/solve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      rawText,
    },
  })

  if (!response.ok || !response.data) {
    throw new Error(response.message || '记忆引擎处理失败')
  }

  return response.data
}

/**
 * 记忆共创对话接口
 */
export async function memoryChat(message: string, sessionId?: string) {
  return await $fetch<MemoryChatResponse>(`${API_BASE_URL}/memory/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      sessionId,
      message,
    },
  })
}

/**
 * 健康检查
 */
export async function healthCheck() {
  try {
    const response = await $fetch('http://localhost:8000/health', {
      method: 'GET',
    })
    return response
  } catch (error) {
    console.error('健康检查失败:', error)
    throw error
  }
}
