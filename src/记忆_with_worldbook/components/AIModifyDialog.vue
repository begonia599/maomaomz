<template>
  <div
    v-if="show"
    @click.self="$emit('close')"
    style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      z-index: 1000000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    "
  >
    <div
      style="
        background: #2a2a2a;
        border: 2px solid #ffc107;
        border-radius: 12px;
        padding: 30px;
        max-width: 600px;
        width: 100%;
        max-height: 80vh;
        overflow-y: auto;
      "
      @click.stop
    >
      <h3 style="color: #ffc107; margin: 0 0 20px 0">
        <i class="fa-solid fa-edit"></i>
        {{ title || 'AI 修改' }}
      </h3>
      <p style="color: #888; margin: 0 0 15px 0; line-height: 1.6">
        {{ description || '描述你想要修改的地方，AI 会在当前基础上进行调整。' }}
      </p>
      <ul
        v-if="examples && examples.length > 0"
        style="color: #888; margin: 0 0 20px 0; padding-left: 20px; line-height: 1.8"
      >
        <li v-for="(example, index) in examples" :key="index">{{ example }}</li>
      </ul>
      <textarea
        v-model="localInstruction"
        :placeholder="placeholder || '输入修改建议...'"
        style="
          width: 100%;
          min-height: 150px;
          background: #1a1a1a;
          color: #e0e0e0;
          border: 1px solid #444;
          border-radius: 4px;
          padding: 12px;
          font-size: 14px;
          margin-bottom: 20px;
          resize: vertical;
          box-sizing: border-box;
        "
      ></textarea>
      <!-- 加载进度条 -->
      <div
        v-if="isModifying"
        style="margin-bottom: 20px; background: #1a1a1a; border-radius: 8px; padding: 15px; border: 1px solid #444"
      >
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px">
          <i
            class="fa-solid fa-wand-magic-sparkles"
            style="color: #ffc107; font-size: 18px; animation: pulse 1.5s infinite"
          ></i>
          <span style="color: #ffc107; font-weight: 600; font-size: 14px">AI 正在生成中...</span>
        </div>

        <!-- 进度信息 -->
        <template v-if="progress">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px">
            <span style="color: #ffc107; font-size: 13px; font-weight: 600">
              步骤 {{ progress.step }}/{{ progress.total }}: {{ progress.stepName }}
            </span>
            <span style="color: #e0e0e0; font-size: 14px; font-weight: 700"> {{ progress.percentage }}% </span>
          </div>
          <div
            style="width: 100%; height: 6px; background: #333; border-radius: 3px; overflow: hidden; margin-bottom: 8px"
          >
            <div
              style="
                height: 100%;
                background: linear-gradient(90deg, #ffc107 0%, #ffb300 100%);
                transition: width 0.4s ease;
                box-shadow: 0 0 10px rgba(255, 193, 7, 0.5);
              "
              :style="{ width: progress.percentage + '%' }"
            ></div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center">
            <span style="color: #888; font-size: 12px">{{ progress.message }}</span>
            <span v-if="progress.elapsedTime" style="color: #888; font-size: 12px">
              已耗时: {{ progress.elapsedTime }}秒
            </span>
          </div>
        </template>

        <!-- 默认进度条（无详细信息时） -->
        <template v-else>
          <div
            style="width: 100%; height: 6px; background: #333; border-radius: 3px; overflow: hidden; position: relative"
          >
            <div class="progress-bar"></div>
          </div>
          <p style="color: #888; font-size: 12px; margin: 8px 0 0 0; text-align: center">请稍候，这可能需要几秒钟</p>
        </template>
      </div>

      <div style="display: flex; gap: 12px">
        <button
          @click="handleConfirm"
          :disabled="!localInstruction || isModifying"
          style="
            flex: 1;
            background: #ffc107;
            color: #000;
            border: none;
            padding: 12px 24px;
            border-radius: 10px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.2s;
            position: relative;
            overflow: hidden;
          "
          :style="{ opacity: !localInstruction || isModifying ? 0.5 : 1 }"
        >
          <i class="fa-solid fa-wand-magic-sparkles" :class="{ 'icon-spin': isModifying }"></i>
          {{ isModifying ? '生成中...' : '确认生成' }}
        </button>
        <button
          @click="$emit('close')"
          :disabled="isModifying"
          style="
            flex: 1;
            background: #666;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 10px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.2s;
          "
          :style="{ opacity: isModifying ? 0.5 : 1 }"
        >
          取消
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface ProgressInfo {
  step: number;
  total: number;
  stepName: string;
  percentage: number;
  message: string;
  elapsedTime?: number;
}

const props = defineProps<{
  show: boolean;
  title?: string;
  description?: string;
  examples?: string[];
  placeholder?: string;
  isModifying?: boolean;
  progress?: ProgressInfo; // 进度信息
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'confirm', instruction: string): void;
}>();

const localInstruction = ref('');

// 当对话框显示时，清空输入
watch(
  () => props.show,
  newVal => {
    if (newVal) {
      localInstruction.value = '';
    }
  },
);

const handleConfirm = () => {
  if (localInstruction.value && !props.isModifying) {
    emit('confirm', localInstruction.value);
  }
};
</script>

<style scoped>
button:disabled {
  cursor: not-allowed !important;
}

button:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* 滚动条样式 */
div::-webkit-scrollbar {
  width: 6px;
}

div::-webkit-scrollbar-track {
  background: #1a1a1a;
  border-radius: 3px;
}

div::-webkit-scrollbar-thumb {
  background: #4a9eff;
  border-radius: 3px;
}

div::-webkit-scrollbar-thumb:hover {
  background: #5ab0ff;
}

/* 进度条动画 */
.progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background: linear-gradient(90deg, #ffc107 0%, #ffb300 50%, #ffc107 100%);
  background-size: 200% 100%;
  animation: progressMove 2s linear infinite;
  box-shadow: 0 0 10px rgba(255, 193, 7, 0.5);
}

@keyframes progressMove {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* 脉冲动画 */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

/* 图标旋转动画 */
.icon-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
