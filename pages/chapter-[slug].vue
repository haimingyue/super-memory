<template>
  <div class="chapter-reader">
    <div class="reader-header">
      <button class="back-btn" @click="goBack">
        <span>←</span> 返回章节列表
      </button>

      <div class="chapter-nav">
        <button
          class="nav-btn"
          :disabled="!hasPrev"
          @click="navigateToPrev"
        >
          ← 上一章
        </button>
        <button
          class="nav-btn"
          :disabled="!hasNext"
          @click="navigateToNext"
        >
          下一章 →
        </button>
      </div>
    </div>

    <article class="chapter-content">
      <header class="chapter-header">
        <span class="chapter-number">{{ currentChapter?.number }}</span>
        <h1>{{ currentChapter?.title }}</h1>
        <p class="chapter-subtitle">{{ currentChapter?.subtitle }}</p>
      </header>

      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>正在加载章节内容...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button @click="loadChapterContent">重试</button>
      </div>

      <div v-else class="markdown-content" v-html="renderedContent"></div>

      <footer class="chapter-footer">
        <div class="progress-info">
          <span>阅读进度：{{ currentChapter?.number }} / {{ totalChapters }}</span>
        </div>
        <div class="nav-buttons">
          <button
            class="primary-btn"
            :disabled="!hasPrev"
            @click="navigateToPrev"
          >
            ← 上一章
          </button>
          <button
            class="primary-btn"
            :disabled="!hasNext"
            @click="navigateToNext"
          >
            下一章 →
          </button>
        </div>
      </footer>
    </article>

    <div class="toc-sidebar">
      <h3>目录</h3>
      <ul class="toc-list">
        <li
          v-for="chapter in chapters"
          :key="chapter.number"
          :class="['toc-item', { active: chapter.number === slug }]"
          @click="goToChapter(chapter.number)"
        >
          <span class="toc-number">{{ chapter.number }}</span>
          <span class="toc-title">{{ chapter.title }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const slug = ref('')

interface Chapter {
  number: string
  title: string
  subtitle: string
}

const chapters: Chapter[] = [
  { number: '00', title: '前言', subtitle: 'Foreword' },
  { number: '01', title: '观察力的敏锐度', subtitle: 'How Keen Is Your Observation' },
  { number: '02', title: '习惯即记忆', subtitle: 'Habit Is Memory' },
  { number: '03', title: '测试你的记忆力', subtitle: 'Test Your Memory' },
  { number: '04', title: '对记忆的兴趣', subtitle: 'Interest in Memory' },
  { number: '05', title: '链式记忆法', subtitle: 'Link Method of Memory' },
  { number: '06', title: '挂钩记忆系统', subtitle: 'Peg System of Memory' },
  { number: '07', title: '挂钩和链式系统的应用', subtitle: 'Uses of the Peg and Link Systems' },
  { number: '08', title: '如何训练你的观察力', subtitle: 'How to Train Your Observation' },
  { number: '09', title: '记住演讲、文章、剧本和轶事', subtitle: 'It Pays to Remember Speeches, Articles, Scripts and Anecdotes' },
  { number: '10', title: '记住扑克牌', subtitle: 'It Pays to Remember Playing Cards' },
  { number: '11', title: '记住长数字', subtitle: 'It Pays to Remember Long Digit Numbers' },
  { number: '12', title: '应急用的挂钩', subtitle: 'Some Pegs for Emergencies' },
  { number: '13', title: '记住日期', subtitle: 'It Pays to Remember Dates' },
  { number: '14', title: '记住外语词汇和抽象信息', subtitle: 'It Pays to Remember Foreign Language Vocabulary & Abstract Information' },
  { number: '15', title: '记住姓名和容貌', subtitle: 'It Pays to Remember Names and Faces' },
  { number: '16', title: '姓名里有什么学问', subtitle: "What's in a Name" },
  { number: '17', title: '关于姓名和容貌的更多内容', subtitle: 'More about Names and Faces' },
  { number: '18', title: '记住关于人的事实', subtitle: 'It Pays to Remember Facts about People' },
  { number: '19', title: '记住电话号码', subtitle: 'It Pays to Remember Telephone Numbers' },
  { number: '20', title: '记忆的重要性', subtitle: 'The Importance of Memory' },
  { number: '21', title: '不要心不在焉', subtitle: "Don't Be Absent-minded" },
  { number: '22', title: '让你的朋友们大吃一惊', subtitle: 'Amaze Your Friends' },
  { number: '23', title: '记住约会和日程表', subtitle: 'It Pays to Remember Appointments and Schedules' },
  { number: '24', title: '记住周年纪念日和生日', subtitle: 'It Pays to Remember Anniversaries, Birthdays and Other Important Dates' },
  { number: '25', title: '记忆演示', subtitle: 'Memory Demonstrations' },
  { number: '26', title: '使用这些系统', subtitle: 'Use the Systems' },
]

const currentChapter = ref<Chapter | null>(null)
const chapterContent = ref('')
const loading = ref(false)
const error = ref('')

const totalChapters = chapters.length
const currentIndex = computed(() => chapters.findIndex(c => c.number === slug.value))
const hasPrev = computed(() => currentIndex.value > 0)
const hasNext = computed(() => currentIndex.value < chapters.length - 1)

const renderedContent = computed(() => {
  // 简单的 Markdown 渲染
  let content = chapterContent.value
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/\n/gim, '<br>')
  return content
})

const goBack = () => {
  router.push('/chapters')
}

const goToChapter = (chapterNumber: string) => {
  router.push(`/chapter/${chapterNumber}`)
}

const navigateToPrev = () => {
  if (hasPrev.value) {
    goToChapter(chapters[currentIndex.value - 1].number)
  }
}

const navigateToNext = () => {
  if (hasNext.value) {
    goToChapter(chapters[currentIndex.value + 1].number)
  }
}

const loadChapterContent = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await fetch(`/chapters/${slug.value}.md`)
    if (!response.ok) {
      throw new Error('章节内容加载失败')
    }
    chapterContent.value = await response.text()
  } catch (e) {
    // 如果 markdown 文件不存在，使用默认内容
    chapterContent.value = generateDefaultContent(currentChapter.value)
  } finally {
    loading.value = false
  }
}

const generateDefaultContent = (chapter: Chapter | null): string => {
  if (!chapter) return ''

  return `# ${chapter.title}

## ${chapter.subtitle}

### 本章要点

- 本章内容正在准备中...
- 敬请期待后续更新

### 简介

这是${chapter.title}章节的内容。本章将介绍相关的记忆技巧和方法，帮助你提升记忆力。

---

*注：完整的章节内容将在后续更新。*
`
}

onMounted(() => {
  // 从路由获取 slug
  const route = router.currentRoute.value
  slug.value = route.params.slug as string || '00'

  currentChapter.value = chapters.find(c => c.number === slug.value) || null

  if (currentChapter.value) {
    loadChapterContent()
  }
})

// 监听路由变化
import { watch } from 'vue'
watch(() => router.currentRoute.value.params.slug, (newSlug) => {
  if (newSlug) {
    slug.value = newSlug as string
    currentChapter.value = chapters.find(c => c.number === slug.value) || null
    if (currentChapter.value) {
      loadChapterContent()
    }
  }
})
</script>

<style scoped>
.chapter-reader {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
}

.reader-header {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.back-btn {
  background: transparent;
  border: 1px solid #00dc82;
  color: #00dc82;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #00dc82;
  color: white;
}

.chapter-nav {
  display: flex;
  gap: 0.75rem;
}

.nav-btn {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn:hover:not(:disabled) {
  background: #e0e0e0;
}

.nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.chapter-content {
  background: white;
  border-radius: 12px;
  padding: 2.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.chapter-header {
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #00dc82;
}

.chapter-number {
  display: inline-block;
  background: #00dc82;
  color: white;
  padding: 0.35rem 0.85rem;
  border-radius: 20px;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.chapter-header h1 {
  font-size: 2rem;
  color: #1a1a1a;
  margin: 0.75rem 0;
}

.chapter-subtitle {
  color: #666;
  font-size: 1.1rem;
  font-style: italic;
  margin: 0;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f0f0f0;
  border-top-color: #00dc82;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state button {
  margin-top: 1rem;
  background: #00dc82;
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
}

.markdown-content {
  line-height: 1.9;
  color: #333;
}

.markdown-content :deep(h1) {
  font-size: 1.8rem;
  margin-top: 2rem;
  margin-bottom: 1rem;
  color: #1a1a1a;
}

.markdown-content :deep(h2) {
  font-size: 1.5rem;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  color: #2a2a2a;
}

.markdown-content :deep(h3) {
  font-size: 1.2rem;
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.markdown-content :deep(p) {
  margin-bottom: 1rem;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.markdown-content :deep(li) {
  margin-bottom: 0.5rem;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid #00dc82;
  padding-left: 1rem;
  margin: 1rem 0;
  color: #666;
  font-style: italic;
}

.markdown-content :deep(code) {
  background: #f5f5f5;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.9em;
}

.markdown-content :deep(pre) {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1rem 0;
}

.chapter-footer {
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e0e0e0;
}

.progress-info {
  color: #666;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.nav-buttons {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.primary-btn {
  flex: 1;
  background: #00dc82;
  color: white;
  border: none;
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.primary-btn:hover:not(:disabled) {
  background: #00c474;
  transform: translateY(-1px);
}

.primary-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

.toc-sidebar {
  position: sticky;
  top: 2rem;
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  height: fit-content;
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
}

.toc-sidebar h3 {
  margin: 0 0 1rem;
  color: #1a1a1a;
  font-size: 1.1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e0e0e0;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.toc-item:hover {
  background: #f5f5f5;
}

.toc-item.active {
  background: #e8f9f2;
  color: #00dc82;
  font-weight: 500;
}

.toc-number {
  background: #f0f0f0;
  color: #666;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.toc-item.active .toc-number {
  background: #00dc82;
  color: white;
}

.toc-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 900px) {
  .chapter-reader {
    grid-template-columns: 1fr;
    padding: 1rem;
  }

  .toc-sidebar {
    position: static;
    max-height: none;
  }

  .reader-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .chapter-content {
    padding: 1.5rem;
  }
}
</style>
