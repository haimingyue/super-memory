<template>
  <el-card class="memory-draft-card" shadow="never">
    <div class="header-row">
      <el-tag type="info" effect="light">{{ draft.contentType }}</el-tag>
      <el-tag type="warning" effect="light">{{ draft.hookSystem }}</el-tag>
      <el-tag type="success" effect="light">{{ draft.memoryMethod }}</el-tag>
    </div>

    <el-divider content-position="left">关键词</el-divider>
    <div class="keywords-row">
      <el-tag
        v-for="item in draft.keywords"
        :key="item"
        class="keyword-tag"
        size="small"
        effect="plain"
      >
        {{ item }}
      </el-tag>
    </div>

    <template v-if="draft.contrastMatrix">
      <el-divider content-position="left">对比矩阵</el-divider>
      <div class="matrix-grid">
        <div class="matrix-col">
          <p class="matrix-title">{{ draft.contrastMatrix.titleA || 'A列' }}</p>
          <ul class="matrix-list">
            <li v-for="(item, index) in draft.contrastMatrix.a" :key="`a-${index}-${item}`">{{ item }}</li>
          </ul>
        </div>
        <div class="matrix-col">
          <p class="matrix-title">{{ draft.contrastMatrix.titleB || 'B列' }}</p>
          <ul class="matrix-list">
            <li v-for="(item, index) in draft.contrastMatrix.b" :key="`b-${index}-${item}`">{{ item }}</li>
          </ul>
        </div>
        <div class="matrix-col">
          <p class="matrix-title">{{ draft.contrastMatrix.titleCommon || '共同点' }}</p>
          <ul class="matrix-list">
            <li v-for="(item, index) in draft.contrastMatrix.common" :key="`c-${index}-${item}`">{{ item }}</li>
          </ul>
        </div>
      </div>
    </template>

    <el-divider content-position="left">想象画面</el-divider>
    <ol class="imagery-list">
      <li v-for="(line, index) in draft.imagery" :key="`${index}-${line}`">
        {{ line }}
      </li>
    </ol>

    <el-divider content-position="left">快速复述</el-divider>
    <el-alert :closable="false" type="warning" show-icon>
      <template #default>
        <pre class="recap-block">{{ draft.recap }}</pre>
      </template>
    </el-alert>
  </el-card>
</template>

<script setup lang="ts">
import type { MemoryDraft } from '~/composables/api'

defineProps<{
  draft: MemoryDraft
}>()
</script>

<style scoped>
.memory-draft-card {
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

.matrix-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.matrix-col {
  border: 1px solid #e2e2e2;
  border-radius: 8px;
  padding: 8px 10px;
  background: #fff;
}

.matrix-title {
  margin: 0 0 8px;
  font-weight: 600;
}

.matrix-list {
  margin: 0;
  padding-left: 18px;
  line-height: 1.6;
}

.recap-block {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: Consolas, 'Courier New', monospace;
}

@media (max-width: 760px) {
  .matrix-grid {
    grid-template-columns: 1fr;
  }
}
</style>
