<template>
  <div class="chapter-detail">
    <div v-if="chapter" class="chapter-content">
      <span class="chapter-badge">第 {{ chapter.number }} 章</span>
      <h2>{{ chapter.title }}</h2>
      <p class="english-title">{{ chapter.englishTitle }}</p>

      <div v-if="loading" class="loading">正在加载章节内容...</div>
      <div v-else class="markdown-content" v-html="renderedContent"></div>

      <div class="chapter-links">
        <NuxtLink v-if="prevChapter" :to="`/chapter/${prevChapter.number}`" class="nav-link">
          ← 上一章
        </NuxtLink>
        <NuxtLink to="/chapters" class="nav-link back">
          返回目录
        </NuxtLink>
        <NuxtLink v-if="nextChapter" :to="`/chapter/${nextChapter.number}`" class="nav-link">
          下一章 →
        </NuxtLink>
      </div>
    </div>
    <div v-else class="not-found">
      <h2>章节未找到</h2>
      <p>请从章节列表中选择其他章节</p>
      <NuxtLink to="/chapters" class="back-link">返回章节列表</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const route = useRoute()
const chapterNumber = computed(() => route.params.number as string)

const chapters = [
  { number: '00', title: '前言', englishTitle: 'Foreword' },
  { number: '01', title: '你的观察力有多敏锐', englishTitle: 'How Keen Is Your Observation' },
  { number: '02', title: '习惯即记忆', englishTitle: 'Habit Is Memory' },
  { number: '03', title: '测试你的记忆力', englishTitle: 'Test Your Memory' },
  { number: '04', title: '对记忆的兴趣', englishTitle: 'Interest in Memory' },
  { number: '05', title: '链式记忆法', englishTitle: 'Link Method of Memory' },
  { number: '06', title: '挂钩记忆系统', englishTitle: 'Peg System of Memory' },
  { number: '07', title: '挂钩和链式系统的应用', englishTitle: 'Uses of the Peg and Link Systems' },
  { number: '08', title: '如何训练你的观察力', englishTitle: 'How to Train Your Observation' },
  { number: '09', title: '记住演讲、文章、剧本和轶事是大有裨益的', englishTitle: 'It Pays to Remember Speeches, Articles, Scripts and Anecdotes' },
  { number: '10', title: '记住扑克牌是大有裨益的', englishTitle: 'It Pays to Remember Playing Cards' },
  { number: '11', title: '记住长数字是大有裨益的', englishTitle: 'It Pays to Remember Long Digit Numbers' },
  { number: '12', title: '应急用的挂钩', englishTitle: 'Some Pegs for Emergencies' },
  { number: '13', title: '记住日期是大有裨益的', englishTitle: 'It Pays to Remember Dates' },
  { number: '14', title: '记住外语词汇和抽象信息是大有裨益的', englishTitle: 'It Pays to Remember Foreign Language Vocabulary & Abstract Information' },
  { number: '15', title: '记住姓名和容貌是大有裨益的', englishTitle: 'It Pays to Remember Names and Faces' },
  { number: '16', title: '姓名里有什么学问', englishTitle: "What's in a Name" },
  { number: '17', title: '关于姓名和容貌的更多内容', englishTitle: 'More about Names and Faces' },
  { number: '18', title: '记住关于人的事实是大有裨益的', englishTitle: 'It Pays to Remember Facts about People' },
  { number: '19', title: '记住电话号码是大有裨益的', englishTitle: 'It Pays to Remember Telephone Numbers' },
  { number: '20', title: '记忆的重要性', englishTitle: 'The Importance of Memory' },
  { number: '21', title: '不要心不在焉', englishTitle: "Don't Be Absent-minded" },
  { number: '22', title: '让你的朋友们大吃一惊', englishTitle: 'Amaze Your Friends' },
  { number: '23', title: '记住约会和日程表是大有裨益的', englishTitle: 'It Pays to Remember Appointments and Schedules' },
  { number: '24', title: '记住周年纪念日 生日 其他重要日期是大有裨益的', englishTitle: 'It Pays to Remember Anniversaries, Birthdays and Other Important Dates' },
  { number: '25', title: '记忆演示', englishTitle: 'Memory Demonstrations' },
  { number: '26', title: '使用这些系统', englishTitle: 'Use the Systems' },
]

const currentIndex = computed(() => chapters.findIndex(c => c.number === chapterNumber.value))
const chapter = computed(() => (currentIndex.value >= 0 ? chapters[currentIndex.value] : null))
const prevChapter = computed(() => (currentIndex.value > 0 ? chapters[currentIndex.value - 1] : null))
const nextChapter = computed(() => (
  currentIndex.value < chapters.length - 1 && currentIndex.value >= 0
    ? chapters[currentIndex.value + 1]
    : null
))

const loading = ref(false)
const chapterRawContent = ref('')

const renderMarkdown = (markdown: string): string => {
  return markdown
    .replace(/\r\n/g, '\n')
    .replace(/^### (.*)$/gim, '<h3>$1</h3>')
    .replace(/^## (.*)$/gim, '<h2>$1</h2>')
    .replace(/^# (.*)$/gim, '<h1>$1</h1>')
    .replace(/^\- (.*)$/gim, '<li>$1</li>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/\n/g, '<br>')
}

const renderedContent = computed(() => renderMarkdown(chapterRawContent.value))

const getDefaultContent = (chapterItem: { title: string; englishTitle: string }) => {
  return `# ${chapterItem.title}

## ${chapterItem.englishTitle}

### 本章导读

- 本章内容正在整理中
- 你可以先阅读标题与章节结构
- 后续将持续补充完整内容
`
}

const loadChapterContent = async () => {
  if (!chapter.value) {
    chapterRawContent.value = ''
    return
  }

  loading.value = true
  try {
    const response = await fetch(`/chapters/${chapterNumber.value}.md`)
    if (!response.ok) {
      throw new Error('not found')
    }
    chapterRawContent.value = await response.text()
  } catch {
    chapterRawContent.value = getDefaultContent(chapter.value)
  } finally {
    loading.value = false
  }
}

useHead(() => ({
  title: chapter.value ? `${chapter.value.title} - Super Memory` : '章节未找到',
}))

watch(
  () => chapterNumber.value,
  () => {
    loadChapterContent()
  },
  { immediate: true },
)
</script>

<style scoped>
.chapter-detail {
  max-width: 800px;
  margin: 0 auto;
}

.chapter-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chapter-badge {
  display: inline-block;
  background: linear-gradient(135deg, #00dc82 0%, #00b368 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

h2 {
  color: #333;
  font-size: 1.8rem;
  margin: 0 0 0.5rem 0;
}

.english-title {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.loading {
  color: #666;
  margin-bottom: 1rem;
}

.markdown-content {
  line-height: 1.9;
  color: #333;
  margin-bottom: 1rem;
}

.markdown-content :deep(h1) {
  font-size: 1.7rem;
  margin: 1rem 0;
}

.markdown-content :deep(h2) {
  font-size: 1.35rem;
  margin: 0.75rem 0;
}

.markdown-content :deep(h3) {
  font-size: 1.1rem;
  margin: 0.5rem 0;
}

.markdown-content :deep(li) {
  display: list-item;
  list-style: disc;
  margin-left: 1.25rem;
}

.chapter-links {
  display: flex;
  justify-content: space-between;
  padding-top: 2rem;
  border-top: 1px solid #e0e0e0;
  margin-top: 2rem;
}

.nav-link {
  color: #00dc82;
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: 1px solid #00dc82;
  transition: all 0.2s;
}

.nav-link:hover {
  background: #00dc82;
  color: white;
  text-decoration: none;
}

.nav-link.back {
  background: #f5f5f5;
  border-color: #e0e0e0;
  color: #666;
}

.nav-link.back:hover {
  background: #e0e0e0;
  color: #333;
}

.not-found {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.not-found h2 {
  color: #666;
}

.back-link {
  display: inline-block;
  margin-top: 1rem;
  color: #00dc82;
  font-weight: 500;
}
</style>
