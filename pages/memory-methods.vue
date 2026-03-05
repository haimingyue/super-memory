<template>
  <div class="memory-methods-page">
    <div class="page-header">
      <h1>记忆方法介绍</h1>
      <p class="description">探索各种记忆技巧，提升你的记忆力</p>
    </div>

    <!-- 方法卡片展示区 -->
    <div class="methods-grid">
      <el-card
        v-for="(method, index) in memoryMethods"
        :key="index"
        class="method-card"
        shadow="hover"
        @click="toggleExpand(index)"
      >
        <template #header>
          <div class="card-header">
            <span class="method-icon">{{ method.icon }}</span>
            <div class="method-info">
              <h3>{{ method.title }}</h3>
              <p class="method-subtitle">{{ method.subtitle }}</p>
            </div>
            <el-tag :type="getMethodTagType(method.difficulty)">{{ getDifficultyText(method.difficulty) }}</el-tag>
          </div>
        </template>

        <el-collapse v-model="activeNames">
          <el-collapse-item :name="String(index)">
            <div class="method-content">
              <!-- 核心概念 -->
              <section class="method-section">
                <h4><el-icon><InfoFilled /></el-icon> 核心概念</h4>
                <p>{{ method.description }}</p>
              </section>

              <!-- 适用场景 -->
              <section class="method-section">
                <h4><el-icon><List /></el-icon> 适用场景</h4>
                <div class="scenario-tags">
                  <el-tag
                    v-for="scenario in method.scenarios"
                    :key="scenario"
                    size="small"
                    class="scenario-tag"
                  >
                    {{ scenario }}
                  </el-tag>
                </div>
              </section>

              <!-- 应用实例 -->
              <section class="method-section">
                <h4><el-icon><DocumentChecked /></el-icon> 应用实例</h4>
                <div class="example-box">
                  <p>{{ method.example.description }}</p>
                  <div class="example-visual" v-if="method.example.visual">
                    <el-icon :size="32"><component :is="method.example.visual" /></el-icon>
                    <span>{{ method.example.visualText }}</span>
                  </div>
                </div>
              </section>

              <!-- 互动练习 -->
              <section class="method-section practice-section">
                <h4><el-icon><Promotion /></el-icon> 互动练习</h4>
                <div class="practice-area">
                  <p class="practice-instruction">{{ method.practice.instruction }}</p>

                  <div v-if="method.practice.inputType === 'text'" class="input-group">
                    <el-input
                      v-model="method.practice.userInput"
                      :placeholder="method.practice.placeholder"
                      :rows="3"
                      type="textarea"
                    />
                  </div>

                  <div v-if="method.practice.inputType === 'number'" class="input-group">
                    <el-input
                      v-model="method.practice.userInput"
                      placeholder="输入数字序列"
                      maxlength="10"
                    />
                  </div>

                  <div v-if="method.practice.items && method.practice.items.length > 0" class="items-display">
                    <div class="items-to-remember">
                      <span class="items-label">请记忆：</span>
                      <el-tag
                        v-for="(item, i) in method.practice.items"
                        :key="i"
                        class="item-tag"
                        effect="plain"
                      >
                        {{ item }}
                      </el-tag>
                    </div>
                  </div>

                  <div class="practice-actions">
                    <el-button type="primary" @click="startPractice(index)" :loading="method.practice.loading">
                      开始练习
                    </el-button>
                    <el-button @click="generateNewTask(index)">
                      换一题
                    </el-button>
                  </div>

                  <!-- 练习反馈 -->
                  <el-alert
                    v-if="method.practice.feedback"
                    :title="method.practice.feedback.title"
                    :type="method.practice.feedback.type"
                    :description="method.practice.feedback.description"
                    show-icon
                    closable
                    class="practice-feedback"
                  />
                </div>
              </section>
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-card>
    </div>

    <!-- 快速挑战区 -->
    <div class="quick-challenge">
      <h2>快速挑战</h2>
      <p>随机选择一个记忆方法进行练习</p>
      <el-button type="success" size="large" @click="startRandomChallenge">
        <el-icon><Thunder /></el-icon>
        开始随机挑战
      </el-button>
    </div>

    <!-- 学习进度 -->
    <div class="progress-section">
      <h2>我的学习进度</h2>
      <div class="progress-cards">
        <div v-for="(progress, index) in progressData" :key="index" class="progress-card">
          <div class="progress-header">
            <span>{{ progress.methodName }}</span>
            <span class="progress-percent">{{ progress.percent }}%</span>
          </div>
          <el-progress :percentage="progress.percent" :status="progress.percent === 100 ? 'success' : ''" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { InfoFilled, DocumentChecked, List, Promotion, Thunder } from '@element-plus/icons-vue'

interface PracticeFeedback {
  title: string
  type: 'success' | 'info' | 'warning' | 'error'
  description: string
}

interface Practice {
  instruction: string
  inputType: 'text' | 'number' | 'none'
  placeholder?: string
  userInput: string
  items: string[]
  loading: boolean
  feedback: PracticeFeedback | null
  currentTask: string
}

interface MemoryMethod {
  title: string
  subtitle: string
  icon: string
  description: string
  scenarios: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  example: {
    description: string
    visual?: string
    visualText?: string
  }
  practice: Practice
}

const activeNames = ref<string[]>([])

const memoryMethods = reactive<MemoryMethod[]>([
  {
    title: '链式记忆法',
    subtitle: 'Link Method',
    icon: '🔗',
    description: '将需要记忆的物品通过心理图像串联成链条，适用于记忆顺序无关的内容。每个元素与下一个元素形成夸张的视觉联想，让回忆变得自然流畅。',
    scenarios: ['购物清单', '演讲稿要点', '待办事项', '故事流程'],
    difficulty: 'beginner',
    example: {
      description: '记忆购物清单"牛奶、面包、鸡蛋、水果"：想象一盒牛奶倒出形成河流，河流上漂浮着巨大的面包船，面包船里装满了鸡蛋，鸡蛋壳里长出各种水果。',
      visualText: '牛奶 → 面包 → 鸡蛋 → 水果'
    },
    practice: {
      instruction: '尝试将以下物品用链式法串联成一个故事：',
      inputType: 'text',
      placeholder: '在这里写下你的联想故事...',
      userInput: '',
      items: [],
      loading: false,
      feedback: null,
      currentTask: ''
    }
  },
  {
    title: '挂钩记忆法',
    subtitle: 'Peg System',
    icon: '🎯',
    description: '为数字或编号分配一个固定的可视化图像（挂钩），然后将需要记忆的内容与这些挂钩进行联想。特别适合记忆有顺序的信息。',
    scenarios: ['电话号码', '历史年代', '步骤流程', '有序列表'],
    difficulty: 'intermediate',
    example: {
      description: '使用形状挂钩法：1=铅笔，2=天鹅，3=耳朵。要记"1 苹果、2 香蕉、3 橙子"，想象铅笔戳穿苹果、天鹅叼着香蕉、耳朵上挂着橙子。',
      visualText: '1→铅笔，2→天鹅，3→耳朵'
    },
    practice: {
      instruction: '用挂钩法记住下面的数字，然后输入你联想到的图像：',
      inputType: 'number',
      placeholder: '输入你记住的数字',
      userInput: '',
      items: [],
      loading: false,
      feedback: null,
      currentTask: ''
    }
  },
  {
    title: '代替词系统',
    subtitle: 'Substitute Word System',
    icon: '🔄',
    description: '将抽象、无意义或外语词汇转化为熟悉的、可视觉化的词语，通过声音或形状的相似性进行联想记忆。',
    scenarios: ['外语单词', '专业术语', '人名', '抽象概念'],
    difficulty: 'intermediate',
    example: {
      description: '记西班牙语 "pájaro"（鸟）：发音像 "park car"，想象一只鸟停在停着的车上。记 "ponderous"（笨重的）：联想 "胖得要死"。',
      visualText: 'pájaro → park car → 鸟'
    },
    practice: {
      instruction: '将下面的外语单词转化为代替词并联想：',
      inputType: 'text',
      placeholder: '写下你的代替词和联想...',
      userInput: '',
      items: [],
      loading: false,
      feedback: null,
      currentTask: ''
    }
  },
  {
    title: '记忆宫殿法',
    subtitle: 'Memory Palace',
    icon: '🏛️',
    description: '利用熟悉的空间位置（如家中的房间）作为记忆的"挂钩"，将要记忆的内容放在特定位置，通过"行走"在空间中来回忆。',
    scenarios: ['长篇演讲', '复杂流程', '大量信息', '考试复习'],
    difficulty: 'advanced',
    example: {
      description: '要记演讲内容：开场白放门口鞋柜上，第一个论点放客厅沙发，第二个论点放厨房冰箱，结尾放卧室床头。按进门路线走一遍就能回忆。',
      visualText: '门口 → 客厅 → 厨房 → 卧室'
    },
    practice: {
      instruction: '选择一个你熟悉的空间，将下面的项目放在不同位置：',
      inputType: 'text',
      placeholder: '描述你的记忆宫殿布局...',
      userInput: '',
      items: [],
      loading: false,
      feedback: null,
      currentTask: ''
    }
  },
  {
    title: '数字编码法',
    subtitle: 'Number Encoding',
    icon: '🔢',
    description: '将数字转换为字母或图像进行记忆。常用方法包括：数字形状法、数字谐音法、主要系统（Major System）等。',
    scenarios: ['长数字', '密码', '账号', '日期'],
    difficulty: 'advanced',
    example: {
      description: '用谐音法记 14919："一事久要久"。用形状法记 100：想象一根铅笔（1）和两个鸡蛋（00）。',
      visualText: '14919 → 一事久要久'
    },
    practice: {
      instruction: '用编码法记住下面的数字串：',
      inputType: 'number',
      placeholder: '输入你记住的数字',
      userInput: '',
      items: [],
      loading: false,
      feedback: null,
      currentTask: ''
    }
  },
  {
    title: '首字母缩写法',
    subtitle: 'Acronym Method',
    icon: '🔤',
    description: '取一组词的首字母组成新的词语或句子，帮助记忆相关信息。这是最常用且最简单的记忆技巧之一。',
    scenarios: ['列表记忆', '规则要点', '分类项目', '公式'],
    difficulty: 'beginner',
    example: {
      description: '记彩虹颜色 ROYGBIV（红橙黄绿蓝靛紫）。记五行"金木水火土"记作"今木水火土"。',
      visualText: 'ROYGBIV → 彩虹七色'
    },
    practice: {
      instruction: '为下面的词语列表创建一个首字母缩写：',
      inputType: 'text',
      placeholder: '输入你创建的缩写或句子...',
      userInput: '',
      items: [],
      loading: false,
      feedback: null,
      currentTask: ''
    }
  }
])

const progressData = ref([
  { methodName: '链式记忆法', percent: 0 },
  { methodName: '挂钩记忆法', percent: 0 },
  { methodName: '代替词系统', percent: 0 },
  { methodName: '记忆宫殿法', percent: 0 },
  { methodName: '数字编码法', percent: 0 },
  { methodName: '首字母缩写法', percent: 0 }
])

// 练习题库
const practiceTasks = {
  chain: [
    ['苹果', '香蕉', '橙子', '葡萄', '西瓜'],
    ['书本', '电脑', '手机', '眼镜', '水杯'],
    ['猫', '狗', '鸟', '鱼', '兔子'],
    ['火车', '汽车', '飞机', '轮船', '自行车']
  ],
  peg: [
    ['1314520', '5201314', '1314920'],
    ['1949', '2008', '1978'],
    ['10086', '10010', '10000']
  ],
  substitute: [
    ['ambulance', 'piano', 'guitar'],
    ['philosophy', 'psychology', 'biology'],
    ['Renaissance', 'Revolution', 'Industrial']
  ],
  palace: [
    ['开场白', '第一个论点', '第二个论点', '第三个论点', '结尾'],
    ['早餐', '午餐', '晚餐', '零食', '饮料'],
    ['春', '夏', '秋', '冬', '节气']
  ],
  number: [
    ['149193650', '10050086', '1357924680'],
    ['19491001', '20080808', '19970701'],
    ['100200300', '123456789', '987654321']
  ],
  acronym: [
    ['苹果', '香蕉', '橙子', '葡萄'],
    ['春', '夏', '秋', '冬'],
    ['东', '南', '西', '北'],
    ['金', '木', '水', '火', '土']
  ]
}

const taskTypes = ['chain', 'peg', 'substitute', 'palace', 'number', 'acronym']

const getMethodTagType = (difficulty: string) => {
  const types = {
    beginner: 'success',
    intermediate: 'warning',
    advanced: 'danger'
  }
  return types[difficulty as keyof typeof types]
}

const getDifficultyText = (difficulty: string) => {
  const texts = {
    beginner: '入门',
    intermediate: '进阶',
    advanced: '高级'
  }
  return texts[difficulty as keyof typeof texts]
}

const toggleExpand = (index: number) => {
  const indexStr = String(index)
  const currentIndex = activeNames.value.indexOf(indexStr)
  if (currentIndex > -1) {
    activeNames.value = activeNames.value.filter(n => n !== indexStr)
  } else {
    activeNames.value = [indexStr]
  }
}

const startPractice = (index: number) => {
  const method = memoryMethods[index]
  method.practice.loading = true

  // 模拟练习评估
  setTimeout(() => {
    method.practice.loading = false

    if (!method.practice.userInput.trim()) {
      method.practice.feedback = {
        title: '请完成练习',
        type: 'warning',
        description: '请先输入你的答案或联想内容，然后点击提交。'
      }
    } else {
      // 简单验证逻辑
      const feedback = getPracticeFeedback(index, method.practice.userInput, method.practice.currentTask)
      method.practice.feedback = feedback

      // 更新进度
      progressData.value[index].percent = Math.min(100, progressData.value[index].percent + 20)
    }
  }, 1000)
}

const getPracticeFeedback = (index: number, userInput: string, currentTask: string): PracticeFeedback => {
  if (userInput.length < 5) {
    return {
      title: '需要更详细的联想',
      type: 'info',
      description: '尝试创建更生动、更夸张的视觉联想，这样更容易记住。'
    }
  }

  return {
    title: '做得很好！',
    type: 'success',
    description: '你已经掌握了基本的联想技巧。继续练习可以提高记忆效率！'
  }
}

const generateNewTask = (index: number) => {
  const method = memoryMethods[index]
  const taskType = taskTypes[index]
  const tasks = practiceTasks[taskType as keyof typeof practiceTasks]
  const randomTask = tasks[Math.floor(Math.random() * tasks.length)]

  method.practice.items = Array.isArray(randomTask) ? randomTask : [randomTask]
  method.practice.currentTask = Array.isArray(randomTask) ? randomTask.join(' ') : randomTask
  method.practice.userInput = ''
  method.practice.feedback = null
}

const startRandomChallenge = () => {
  // 随机选择一个方法并展开
  const randomIndex = Math.floor(Math.random() * memoryMethods.length)
  const indexStr = String(randomIndex)

  if (!activeNames.value.includes(indexStr)) {
    activeNames.value = [indexStr]
  }

  generateNewTask(randomIndex)

  // 滚动到该卡片
  setTimeout(() => {
    document.querySelector('.memory-methods-page')?.scrollIntoView({ behavior: 'smooth' })
  }, 100)
}

// 初始化时生成练习题目
memoryMethods.forEach((_, index) => {
  generateNewTask(index)
})
</script>

<style scoped>
.memory-methods-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #00dc82;
  margin-bottom: 0.5rem;
}

.page-header .description {
  color: #666;
  font-size: 1.1rem;
}

.methods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.method-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.method-card:hover {
  transform: translateY(-4px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.method-icon {
  font-size: 2.5rem;
}

.method-info h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.method-subtitle {
  margin: 0.25rem 0 0;
  color: #666;
  font-size: 0.9rem;
}

.method-content {
  padding: 0.5rem 0;
}

.method-section {
  margin-bottom: 1.5rem;
}

.method-section h4 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #00dc82;
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.method-section p {
  color: #555;
  line-height: 1.7;
}

.scenario-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.scenario-tag {
  background: #f0f9ff;
  border-color: #bae6fd;
  color: #0369a1;
}

.example-box {
  background: #f9fafb;
  border-radius: 8px;
  padding: 1rem;
  border-left: 4px solid #00dc82;
}

.example-visual {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: #fff;
  border-radius: 6px;
  font-family: monospace;
  color: #666;
}

.practice-section {
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  border-radius: 12px;
  padding: 1.25rem;
}

.practice-area {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.practice-instruction {
  font-weight: 500;
  color: #333;
}

.input-group {
  width: 100%;
}

.items-display {
  background: #fff;
  border-radius: 8px;
  padding: 1rem;
}

.items-to-remember {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.items-label {
  font-weight: 500;
  color: #333;
}

.item-tag {
  margin-right: 0.25rem;
}

.practice-actions {
  display: flex;
  gap: 0.75rem;
}

.practice-feedback {
  margin-top: 0.5rem;
}

.quick-challenge {
  text-align: center;
  background: linear-gradient(135deg, #00dc82 0%, #00b368 100%);
  border-radius: 16px;
  padding: 2.5rem;
  margin-bottom: 3rem;
  color: white;
}

.quick-challenge h2 {
  margin: 0 0 0.5rem;
  font-size: 1.8rem;
}

.quick-challenge p {
  margin: 0 0 1.5rem;
  opacity: 0.9;
}

.quick-challenge .el-button {
  background: white;
  color: #00dc82;
  border: none;
}

.quick-challenge .el-button:hover {
  background: #f0fdf4;
}

.progress-section {
  background: #fff;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.progress-section h2 {
  text-align: center;
  color: #333;
  margin-bottom: 1.5rem;
}

.progress-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.progress-card {
  background: #f9fafb;
  border-radius: 12px;
  padding: 1.25rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.progress-header span:first-child {
  font-weight: 500;
  color: #333;
}

.progress-percent {
  color: #00dc82;
  font-weight: 600;
}

@media (max-width: 768px) {
  .memory-methods-page {
    padding: 1rem;
  }

  .page-header h1 {
    font-size: 1.8rem;
  }

  .methods-grid {
    grid-template-columns: 1fr;
  }

  .quick-challenge {
    padding: 1.5rem;
  }

  .progress-cards {
    grid-template-columns: 1fr;
  }
}
</style>
