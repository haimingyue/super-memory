<template>
  <div class="train-shell">
    <aside class="left-sidebar">
      <div class="brand-row">
        <div class="brand-icon">◎</div>
      </div>

      <nav class="quick-actions">
        <button
          v-for="action in quickActions"
          :key="action.label"
          class="quick-btn"
          type="button"
          @click="action.onClick"
        >
          <span class="dot">○</span>
          <span>{{ action.label }}</span>
        </button>
      </nav>

      <section class="project-group">
        <p class="group-title">项目</p>
        <button v-for="item in projects" :key="item" class="project-item" type="button">
          {{ item }}
        </button>
      </section>

      <section class="project-group muted">
        <p class="group-title">最近</p>
        <button v-for="item in recentItems" :key="item" class="project-item" type="button">
          {{ item }}
        </button>
      </section>

      <div class="sidebar-bottom">
        <div ref="menuRootRef" class="menu-root">
          <transition name="menu-fade">
            <div v-if="isUserMenuOpen" class="user-popover" role="dialog" aria-label="用户菜单">
              <div class="profile-head">
                <div class="avatar">QH</div>
                <div class="profile-text">
                  <p class="name">qian heming</p>
                  <p class="handle">@simoonqian1990</p>
                </div>
              </div>

              <div class="divider"></div>

              <button class="menu-item" type="button" @click="goMemoryMethods">
                <span class="icon">✦</span>
                <span>记忆方法</span>
              </button>

              <button class="menu-item" type="button" @click="goChapters">
                <span class="icon">▤</span>
                <span>课程章节</span>
              </button>
            </div>
          </transition>
        </div>

        <button
          class="sidebar-userbar"
          type="button"
          :aria-expanded="isUserMenuOpen"
          aria-label="打开用户菜单"
          @click="handleUserbarClick"
        >
          <div class="avatar">QH</div>
          <div class="profile-text">
            <p class="name">qian heming</p>
            <p class="handle">Plus</p>
          </div>
        </button>
      </div>
    </aside>

    <main class="chat-stage">
      <header class="stage-top">
        <div class="model-name">Copilot</div>
      </header>

      <section class="stage-content">
        <div v-if="messages.length === 0" class="hero-block">
          <h1>我们先从哪里开始呢？</h1>
          <p>输入题目和答案，Copilot 会自动生成记忆卡片。</p>
        </div>

        <div v-else class="conversation">
          <article v-for="message in messages" :key="message.id" :class="['chat-item', message.role]">
            <div class="bubble">
              <MemoryDraftCard
                v-if="message.type === 'memory_draft' && message.memoryDraft"
                :draft="message.memoryDraft"
              />
              <MemoryCard
                v-else-if="message.type === 'memory_card' && message.finalCard"
                :card="message.finalCard"
                @save="handleSaveCard"
                @continue-edit="handleContinueEdit"
              />
              <p v-else class="message-text">{{ message.content || '' }}</p>
            </div>
          </article>
        </div>

        <div v-if="loading" class="loading-tip">记忆引擎正在生成中...</div>
      </section>

      <footer class="composer-wrap">
        <div v-if="isDev" class="dev-tools">
          <span class="dev-label">示例填充</span>
          <button type="button" class="dev-btn" @click="fillDemo('osi')">OSI 七层</button>
          <button type="button" class="dev-btn" @click="fillDemo('tcpUdp')">TCP vs UDP</button>
          <button type="button" class="dev-btn" @click="fillDemo('pm')">五大过程组</button>
        </div>
        <form class="composer" @submit.prevent="handleSubmit">
          <textarea
            v-model="prompt"
            rows="3"
            placeholder="输入题目+答案生成草稿；再继续对话修改；说“生成卡片”输出最终版"
            aria-label="输入记忆内容"
          />
          <button class="send-btn" type="submit" :disabled="loading || !prompt.trim()">➤</button>
        </form>
      </footer>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

import { onBeforeUnmount, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import MemoryCard from '~/components/MemoryCard.vue'
import MemoryDraftCard from '~/components/MemoryDraftCard.vue'
import { memoryChat, type MemoryCard as MemoryFinalCard, type MemoryDraft } from '~/composables/api'

interface Message {
  id: string
  role: 'user' | 'assistant'
  type: 'text' | 'memory_draft' | 'memory_card'
  content?: string
  memoryDraft?: MemoryDraft
  finalCard?: MemoryFinalCard
}

const prompt = ref('')
const loading = ref(false)
const messages = ref<Message[]>([])
const sessionId = ref<string | undefined>(undefined)
const isUserMenuOpen = ref(false)
const menuRootRef = ref<HTMLElement | null>(null)

const startNewChat = () => {
  prompt.value = ''
  loading.value = false
  sessionId.value = undefined
  messages.value = []
}

const quickActions = [{ label: '新聊天', onClick: startNewChat }]
const projects = ['新项目', '超级记忆项目开发', '临时', '毕设', 'Python', '毕业设计']
const recentItems = ['Copilot 页面设计', '记忆方法总结']
const isDev = import.meta.dev

const demoInputs = {
  osi: `题目：OSI 七层模型
答案：
1. 物理层：传输比特流与电信号
2. 数据链路层：成帧、差错检测、MAC
3. 网络层：路由与寻址（IP）
4. 传输层：端到端传输（TCP/UDP）
5. 会话层：建立与维护会话
6. 表示层：编码、压缩、加密
7. 应用层：提供用户应用服务`,
  tcpUdp: `题目：TCP vs UDP 的区别
答案：
TCP：面向连接，可靠传输，有拥塞控制，速度相对慢
UDP：无连接，不保证可靠，开销小，速度快
联系：都工作在传输层，都用于端到端通信`,
  pm: `题目：项目管理五大过程组
答案：
一、启动：明确目标并授权项目
二、规划：制定范围、进度、成本与风险计划
三、执行：组织资源并交付工作成果
四、监控：跟踪偏差并纠正
五、收尾：验收交付并总结归档`
}

const fillDemo = (key: keyof typeof demoInputs) => {
  prompt.value = demoInputs[key]
}

const newMessageId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

const handleSaveCard = () => {
  const latestCard = [...messages.value].reverse().find((m) => m.type === 'memory_card' && m.finalCard)?.finalCard
  if (!latestCard) {
    ElMessage.warning('当前没有可保存的卡片')
    return
  }
  try {
    const key = 'memory_saved_cards'
    const prev = JSON.parse(localStorage.getItem(key) || '[]') as Array<unknown>
    prev.unshift(latestCard)
    localStorage.setItem(key, JSON.stringify(prev.slice(0, 50)))
    ElMessage.success('卡片已保存到本地')
  } catch {
    ElMessage.success('已保存（当前为会话内保存示例）')
  }
}

const handleContinueEdit = () => {
  prompt.value = '请基于刚才的最终卡片继续修改：'
}

const goMemoryMethods = async () => {
  isUserMenuOpen.value = false
  await navigateTo('/memory-methods')
}

const goChapters = async () => {
  isUserMenuOpen.value = false
  await navigateTo('/chapters')
}

const handleUserbarClick = (event: MouseEvent) => {
  event.stopPropagation()
  isUserMenuOpen.value = !isUserMenuOpen.value
}

const onDocumentClick = (event: MouseEvent) => {
  if (!isUserMenuOpen.value) {
    return
  }

  const target = event.target as Node | null
  if (target && menuRootRef.value && !menuRootRef.value.contains(target)) {
    isUserMenuOpen.value = false
  }
}

const onDocumentKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    isUserMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onDocumentKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onDocumentKeydown)
})

const handleSubmit = async () => {
  const content = prompt.value.trim()
  if (!content || loading.value) {
    return
  }

  // 添加用户消息
  messages.value.push({
    id: newMessageId(),
    role: 'user',
    content,
    type: 'text',
  })

  prompt.value = ''
  loading.value = true

  try {
    const response = await memoryChat(content, sessionId.value)
    sessionId.value = response.sessionId

    const isMemoryDraftReply = (
      response.replyType === 'memory_draft'
      || response.replyType === 'memory_revision'
      || response.replyType === 'draft'
      || response.replyType === 'revision'
    )
    const isMemoryCardReply = response.replyType === 'memory_card' || response.replyType === 'final_card'
    const degradedTip = response.degraded ? `\n\n[系统降级] ${response.degradeReason || 'none'}` : ''

    if (isMemoryDraftReply && response.draft) {
      messages.value.push({
        id: newMessageId(),
        role: 'assistant',
        type: 'memory_draft',
        content: `${response.replyText}${degradedTip}`,
        memoryDraft: response.draft,
      })
    } else if (isMemoryCardReply && response.finalCard) {
      messages.value.push({
        id: newMessageId(),
        role: 'assistant',
        type: 'memory_card',
        content: `${response.replyText}${degradedTip}`,
        finalCard: response.finalCard,
      })
    } else {
      messages.value.push({
        id: newMessageId(),
        role: 'assistant',
        type: 'text',
        content: `${response.replyText}${degradedTip}`,
      })
    }
  } catch (error) {
    console.error('AI 请求失败:', error)
    messages.value.push({
      id: newMessageId(),
      role: 'assistant',
      type: 'text',
      content: '记忆引擎暂时不可用，请确认后端服务后重试。'
    }) 
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
:global(body) {
  margin: 0;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: #f3f3f3;
  color: #161616;
  overflow: hidden;
}

.train-shell {
  height: 100vh;
  display: grid;
  grid-template-columns: 260px 1fr;
  overflow: hidden;
}

.left-sidebar {
  background: #ebebeb;
  border-right: 1px solid #dddddd;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 0;
  overflow-y: auto;
}

.brand-row {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.brand-icon {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  font-size: 14px;
}

.quick-actions,
.project-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.quick-btn,
.project-item {
  border: 0;
  background: transparent;
  color: #151515;
  text-align: left;
  padding: 8px 10px;
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.quick-btn:hover,
.project-item:hover {
  background: #dfdfdf;
}

.dot {
  color: #5f5f5f;
  font-size: 12px;
}

.group-title {
  margin: 8px 10px 2px;
  font-size: 12px;
  color: #808080;
}

.muted .project-item {
  color: #3f3f3f;
}

.sidebar-bottom {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.menu-root {
  position: relative;
}

.user-popover {
  background: #ececec;
  border: 1px solid #cfcfcf;
  border-radius: 16px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.09);
  padding: 8px;
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 15;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.profile-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px 8px;
}

.avatar {
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background: #2d4e65;
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 10px;
  flex: 0 0 auto;
}

.profile-text {
  min-width: 0;
}

.name {
  margin: 0;
  font-size: 26px;
  transform: scale(0.48);
  transform-origin: left center;
  height: 12px;
  color: #141414;
  white-space: nowrap;
}

.handle {
  margin: 2px 0 0;
  font-size: 24px;
  transform: scale(0.45);
  transform-origin: left center;
  height: 10px;
  color: #7d7d7d;
  white-space: nowrap;
}

.divider {
  margin: 6px 8px;
  height: 1px;
  background: #d6d6d6;
}

.menu-item,
.sidebar-userbar {
  border: 0;
  background: transparent;
  text-align: left;
  border-radius: 10px;
  padding: 8px 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #191919;
  cursor: pointer;
}

.menu-item {
  font-size: 27px;
  transform: scale(0.5);
  transform-origin: left center;
  height: 22px;
}

.menu-item:hover,
.sidebar-userbar:hover {
  background: #e1e1e1;
}

.menu-item .icon,
.brand-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.sidebar-userbar {
  background: #e6e6e6;
  border: 1px solid #dcdcdc;
}

.sidebar-userbar .handle {
  color: #5a5a5a;
}

.chat-stage {
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100vh;
  min-height: 0;
  overflow: hidden;
}

.stage-top {
  height: 60px;
  padding: 0 22px 0 20px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.model-name {
  font-size: 32px;
  letter-spacing: 0.2px;
  color: #212121;
  transform: scale(0.42);
  transform-origin: left center;
}

.stage-content {
  max-width: 760px;
  width: 100%;
  margin: 0 auto;
  padding: 10vh 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.hero-block {
  text-align: center;
  margin-top: 8vh;
}

.hero-block h1 {
  margin: 0;
  font-size: 44px;
  font-weight: 600;
}

.hero-block p {
  margin: 14px 0 0;
  color: #7c7c7c;
  font-size: 15px;
}

.conversation {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.chat-item {
  display: flex;
}

.chat-item.user {
  justify-content: flex-end;
}

.chat-item.assistant {
  justify-content: flex-start;
}

.bubble {
  max-width: min(720px, 92%);
  border-radius: 16px;
  padding: 14px 16px;
  line-height: 1.6;
  font-size: 14px;
}

.chat-item.user .bubble {
  background: #ffffff;
  border: 1px solid #e2e2e2;
}

.chat-item.assistant .bubble {
  background: #f6f6f6;
  border: 1px solid #dfdfdf;
}

.bubble h3 {
  margin: 0 0 8px;
  font-size: 15px;
}

.bubble p {
  margin: 0;
}

.message-text {
  white-space: pre-wrap;
  word-break: break-word;
}

.loading-tip {
  color: #717171;
  font-size: 14px;
}

.composer-wrap {
  padding: 16px 24px 26px;
}

.dev-tools {
  max-width: 760px;
  margin: 0 auto 10px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.dev-label {
  color: #737373;
  font-size: 12px;
}

.dev-btn {
  border: 1px solid #d5d5d5;
  background: #f4f4f4;
  color: #2b2b2b;
  border-radius: 999px;
  padding: 5px 10px;
  font-size: 12px;
  cursor: pointer;
}

.dev-btn:hover {
  background: #ebebeb;
}

.composer {
  max-width: 760px;
  margin: 0 auto;
  background: #ececec;
  border: 1px solid #d9d9d9;
  border-radius: 16px;
  min-height: 88px;
  padding: 10px;
  display: flex;
  align-items: flex-end;
  gap: 8px;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.03);
}

.composer textarea {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: none;
  resize: vertical;
  min-height: 62px;
  background: transparent;
  font-size: 14px;
  color: #343434;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  line-height: 1.6;
}

.composer textarea::placeholder {
  color: #888888;
}

.send-btn {
  border: 0;
  cursor: pointer;
  width: 38px;
  height: 38px;
  border-radius: 999px;
  background: #111111;
  color: #ffffff;
  font-size: 14px;
  display: grid;
  place-items: center;
}

.send-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.fade-enter-active,
.fade-leave-active,
.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: opacity 0.16s ease, transform 0.16s ease;
}

.fade-enter-from,
.fade-leave-to,
.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

@media (max-width: 900px) {
  :global(body) {
    overflow: auto;
  }

  .train-shell {
    height: auto;
    grid-template-columns: 1fr;
    overflow: visible;
  }

  .left-sidebar {
    display: none;
  }

  .chat-stage {
    height: auto;
    overflow: visible;
  }

  .stage-content {
    padding-top: 9vh;
    overflow: visible;
  }

  .hero-block h1 {
    font-size: 30px;
  }
}
</style>
