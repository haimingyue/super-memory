<template>
  <div class="chapters-page">
    <h2>章节列表</h2>
    <p class="description">超级记忆力训练课程</p>

    <div class="chapters-grid">
      <div
        v-for="chapter in chapters"
        :key="chapter.number"
        class="chapter-card"
        @click="goToChapter(chapter.number)"
      >
        <span class="chapter-number">{{ chapter.number }}</span>
        <h3>{{ chapter.title }}</h3>
        <p>{{ chapter.subtitle }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goToChapter = (chapterNumber: string) => {
  router.push(`/chapter/${chapterNumber}`)
}

const chapters = [
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
</script>

<style scoped>
.chapters-page {
  padding: 1rem;
}

h2 {
  color: #00dc82;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.description {
  color: #666;
  margin-bottom: 2rem;
}

.chapters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.chapter-card {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  transition: transform 0.2s, box-shadow 0.2s;
}

.chapter-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.chapter-number {
  display: inline-block;
  background: #00dc82;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.chapter-card h3 {
  margin: 0.5rem 0;
  color: #333;
}

.chapter-card p {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}
</style>
