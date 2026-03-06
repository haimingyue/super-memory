<template>
  <el-card class="memory-card" shadow="never">
    <template #header>
      <div class="header-row">
        <div class="title">最终记忆卡片</div>
        <div class="action-row">
          <el-button size="small" @click="copyCard">复制卡片</el-button>
          <el-button size="small" type="success" @click="exportAnki">导出 Anki</el-button>
          <el-button size="small" type="primary" @click="saveCard">保存</el-button>
          <el-button size="small" type="warning" plain @click="continueEdit">返回继续修改</el-button>
        </div>
      </div>
    </template>

    <el-divider content-position="left">正面 Front</el-divider>
    <el-alert :closable="false" type="info" show-icon>
      <template #default>
        <pre class="card-face">{{ card.front }}</pre>
      </template>
    </el-alert>

    <el-divider content-position="left">反面 Back</el-divider>
    <el-alert :closable="false" type="success" show-icon>
      <template #default>
        <pre class="card-face">{{ card.back }}</pre>
      </template>
    </el-alert>

    <details v-if="isDev" class="debug-box">
      <summary>调试信息</summary>
      <pre class="debug-pre">primaryMethod: {{ card.strategySummary.primaryMethod }}</pre>
      <pre class="debug-pre">secondaryMethods: {{ card.strategySummary.secondaryMethods.join(', ') || 'none' }}</pre>
      <pre class="debug-pre">hookSystem: {{ card.strategySummary.hookSystem }}</pre>
      <pre class="debug-pre">qualityScore: {{ card.strategySummary.qualityScore ?? '-' }}</pre>
      <pre class="debug-pre">anchors: {{ JSON.stringify(anchors, null, 2) }}</pre>
    </details>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { MemoryCard } from '~/composables/api'

const props = defineProps<{
  card: MemoryCard
}>()

const emit = defineEmits<{
  save: []
  continueEdit: []
}>()

const isDev = import.meta.dev

const anchors = computed(() => {
  const structured = props.card.cardFormat?.structured as { anchors?: unknown } | undefined
  return structured?.anchors ?? []
})

const copyCard = async () => {
  try {
    await navigator.clipboard.writeText(`${props.card.front}\n\n${props.card.back}`)
    ElMessage.success('卡片内容已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

const exportAnki = async () => {
  try {
    const ankiText = props.card.cardFormat?.ankiText || `${props.card.front}\t${props.card.back}`
    await navigator.clipboard.writeText(ankiText)
    ElMessage.success('Anki 文本已复制（Front<TAB>Back）')
  } catch {
    ElMessage.error('导出失败')
  }
}

const saveCard = () => {
  emit('save')
  ElMessage.success('卡片已保存到当前会话')
}

const continueEdit = () => {
  emit('continueEdit')
}
</script>

<style scoped>
.memory-card {
  border-color: #e2e2e2;
  background: #f7fbff;
}

.header-row {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.title {
  font-weight: 600;
}

.action-row {
  display: flex;
  gap: 8px;
}

.card-face {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: Consolas, 'Courier New', monospace;
}

.debug-box {
  margin-top: 12px;
  border: 1px dashed #d8d8d8;
  border-radius: 8px;
  padding: 8px 10px;
  background: #fcfcfc;
}

.debug-pre {
  margin: 6px 0 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 12px;
}
</style>
