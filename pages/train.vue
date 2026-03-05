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
        <div class="model-name">Memory Trainer 5.2</div>
      </header>

      <section class="stage-content">
        <div v-if="messages.length === 0" class="hero-block">
          <h1>我们先从哪里开始呢？</h1>
          <p>输入你想记忆的内容，我会给出最合适的记忆方法。</p>
        </div>

        <div v-else class="conversation">
          <article v-for="(message, index) in messages" :key="index" :class="['chat-item', message.role]">
            <div class="bubble">
              <template v-if="message.role === 'user'">
                {{ message.content }}
              </template>
              <template v-else-if="message.feedback">
                <h3>{{ message.feedback.title }}</h3>
                <p>{{ message.feedback.description }}</p>
                <p v-if="message.feedback.example" class="example">示例：{{ message.feedback.example }}</p>
              </template>
            </div>
          </article>
        </div>

        <div v-if="loading" class="loading-tip">正在分析你的记忆内容...</div>
      </section>

      <footer class="composer-wrap">
        <form class="composer" @submit.prevent="handleSubmit">
          <input
            v-model="prompt"
            type="text"
            placeholder="有问题，尽管问"
            aria-label="输入记忆内容"
          >
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

interface Feedback {
  title: string
  description: string
  example?: string
}

interface Message {
  role: 'user' | 'assistant'
  content?: string
  feedback?: Feedback
}

const prompt = ref('')
const loading = ref(false)
const messages = ref<Message[]>([])
const isUserMenuOpen = ref(false)
const menuRootRef = ref<HTMLElement | null>(null)

const startNewChat = () => {
  prompt.value = ''
  loading.value = false
  messages.value = []
}

const quickActions = [{ label: '新聊天', onClick: startNewChat }]
const projects = ['新项目', '超级记忆项目开发', '临时', '毕设', 'Python', '毕业设计']
const recentItems = ['超级记忆页面设计', '记忆训练方法总结']

const memoryMethods = [
  {
    keywords: ['数字', '编号', '顺序', '列表', '日期', '电话', '号码', '密码'],
    title: '推荐使用：挂钩记忆法 (Peg System)',
    description: '适合记有顺序的信息，用固定图像挂钩数字，再把新内容和挂钩图像强联想。',
    example: '记“1苹果 2香蕉 3橙子”，可联想“铅笔戳苹果、天鹅叼香蕉、耳朵挂橙子”。'
  },
  {
    keywords: ['故事', '流程', '步骤', '事件', '清单'],
    title: '推荐使用：链式记忆法 (Link Method)',
    description: '把每个元素串成一个夸张连续的故事，让上下文自然触发回忆。',
    example: '把“牛奶-信件-水果”想成牛奶冲出冰箱淹到信箱，信封长出水果。'
  },
  {
    keywords: ['演讲', '文章', '长列表', '房间', '地点', '路线'],
    title: '推荐使用：记忆宫殿法 (Memory Palace)',
    description: '将信息放在熟悉空间的固定位置，按路线回忆，稳定且可扩展。',
    example: '开场放门口、要点一放客厅、要点二放厨房，按行走顺序提取。'
  },
  {
    keywords: ['外语', '词汇', '抽象', '单词', '概念'],
    title: '推荐使用：联想法 (Association)',
    description: '利用音、形、义与已有知识建立连接，降低生词记忆成本。',
    example: '记“ponderous（笨重）”可联想“胖得要死”，形成语音钩子。'
  }
]

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
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
  console.log('用户栏被点击，当前状态：', isUserMenuOpen.value)
  isUserMenuOpen.value = !isUserMenuOpen.value
  console.log('新状态：', isUserMenuOpen.value)
}

const onDocumentClick = (event: MouseEvent) => {
  if (!isUserMenuOpen.value) {
    return
  }

  const target = event.target as Node | null
  if (target && menuRootRef.value && !menuRootRef.value.contains(target)) {
    console.log('点击了菜单外部，关闭菜单')
    isUserMenuOpen.value = false
  }
}

const onDocumentKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    isUserMenuOpen.value = false
  }
}

onMounted(() => {
  console.log('组件已挂载')
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onDocumentKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onDocumentKeydown)
})

const getFeedback = (text: string): Feedback => {
  const normalized = text.toLowerCase()
  let best: Feedback | null = null
  let bestScore = 0

  for (const method of memoryMethods) {
    const score = method.keywords.filter((keyword) => normalized.includes(keyword)).length
    if (score > bestScore) {
      bestScore = score
      best = {
        title: method.title,
        description: method.description,
        example: method.example
      }
    }
  }

  return best ?? {
    title: '综合记忆建议',
    description: '建议拆块编码 + 图像联想 + 间隔复习三步走，先建检索线索，再强化提取。',
    example: '把内容切成 3-5 个块，每块绑定一个夸张画面，1天后和3天后各复述一次。'
  }
}

const handleSubmit = () => {
  const content = prompt.value.trim()
  if (!content || loading.value) {
    return
  }

  messages.value.push({
    role: 'user',
    content
  })

  prompt.value = ''
  loading.value = true

  setTimeout(() => {
    messages.value.push({
      role: 'assistant',
      feedback: getFeedback(content)
    })

    loading.value = false
  }, 700)
}
</script>

<style scoped>
:global(body) {
  margin: 0;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: #f3f3f3;
  color: #161616;
}

.train-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 260px 1fr;
}

.left-sidebar {
  background: #ebebeb;
  border-right: 1px solid #dddddd;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 14px;
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
  min-height: 100vh;
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

.example {
  margin-top: 8px !important;
  color: #535353;
}

.loading-tip {
  color: #717171;
  font-size: 14px;
}

.composer-wrap {
  padding: 16px 24px 26px;
}

.composer {
  max-width: 760px;
  margin: 0 auto;
  background: #ececec;
  border: 1px solid #d9d9d9;
  border-radius: 999px;
  min-height: 56px;
  padding: 8px 9px 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.03);
}

.composer input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  font-size: 18px;
  transform: scale(0.55);
  transform-origin: left center;
  color: #343434;
}

.composer input::placeholder {
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
  .train-shell {
    grid-template-columns: 1fr;
  }

  .left-sidebar {
    display: none;
  }

  .stage-content {
    padding-top: 9vh;
  }

  .hero-block h1 {
    font-size: 30px;
  }
}
</style>
