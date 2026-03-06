<template>
  <el-card class="memory-card" shadow="never">
    <div class="header-row">
      <el-tag type="info" effect="light">{{ data.typeLabel }}</el-tag>
      <el-tag type="success" effect="light">{{ data.methodLabel }}</el-tag>
    </div>

    <el-divider content-position="left">关键词</el-divider>
    <div class="keywords-row">
      <el-tag
        v-for="item in data.resultBlocks.keywords"
        :key="item"
        class="keyword-tag"
        size="small"
        effect="plain"
      >
        {{ item }}
      </el-tag>
    </div>

    <el-divider content-position="left">想象画面</el-divider>
    <ol class="imagery-list">
      <li v-for="(line, index) in data.resultBlocks.imagery" :key="`${index}-${line}`">
        {{ line }}
      </li>
    </ol>

    <el-divider content-position="left">快速复述</el-divider>
    <el-alert :closable="false" type="warning" show-icon>
      <template #default>
        <pre class="recap-block">{{ data.resultBlocks.recap }}</pre>
      </template>
    </el-alert>
  </el-card>
</template>

<script setup lang="ts">
interface MemoryBlocks {
  meta: {
    typeLabel: string
    methodLabel: string
  }
  keywords: string[]
  imagery: string[]
  recap: string
}

interface MemorySolveData {
  typeLabel: string
  methodLabel: string
  resultBlocks: MemoryBlocks
}

defineProps<{
  data: MemorySolveData
}>()
</script>

<style scoped>
.memory-card {
  border-color: #e2e2e2;
  background: #f9f9f9;
}

.header-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.keywords-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.keyword-tag {
  margin: 0;
}

.imagery-list {
  margin: 0;
  padding-left: 20px;
  line-height: 1.8;
}

.recap-block {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: Consolas, 'Courier New', monospace;
}
</style>

