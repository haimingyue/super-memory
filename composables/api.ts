/**
 * API 配置
 */
const API_BASE_URL = 'http://localhost:8000/api'

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
  try {
    const response = await $fetch<{ reply?: string, answer?: string }>(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        messages,
      },
    })
    return response
  } catch (error) {
    console.error('AI 聊天失败:', error)
    throw error
  }
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
