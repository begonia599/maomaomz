<template>
  <div
    v-if="show"
    @click.self="handleClose"
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
        border: 2px solid #667eea;
        border-radius: 12px;
        padding: 30px;
        max-width: 500px;
        width: 100%;
        text-align: center;
      "
      @click.stop
    >
      <h3 style="color: #667eea; margin: 0 0 15px 0">
        <i class="fa-solid fa-wand-magic-sparkles"></i>
        {{ title || 'AI 生成' }}
      </h3>
      <p style="color: #888; margin: 0 0 25px 0; line-height: 1.6">
        {{ description || 'AI 正在为你生成内容...' }}
      </p>

      <!-- 显示输入框（可选） -->
      <textarea
        v-if="showInput"
        v-model="localInput"
        :placeholder="placeholder || '输入你的需求...'"
        style="
          width: 100%;
          min-height: 120px;
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

      <!-- 加载动画 -->
      <div v-if="isGenerating" style="margin-bottom: 25px">
        <!-- 主加载圆环 -->
        <div style="position: relative; display: inline-block; width: 80px; height: 80px">
          <!-- 外圈装饰 -->
          <div
            style="
              position: absolute;
              width: 100%;
              height: 100%;
              border: 3px solid rgba(102, 126, 234, 0.1);
              border-radius: 50%;
            "
          ></div>
          <!-- 旋转圆环 -->
          <div
            style="
              position: absolute;
              width: 100%;
              height: 100%;
              border: 4px solid transparent;
              border-top-color: #667eea;
              border-right-color: #764ba2;
              border-radius: 50%;
              animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
            "
          ></div>
          <!-- 内圈脉冲 -->
          <div
            style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 40%;
              height: 40%;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 50%;
              animation: pulse 1.5s ease-in-out infinite;
            "
          ></div>
        </div>

        <!-- 进度文字 -->
        <p style="color: #888; margin-top: 20px; font-size: 14px; font-weight: 500">
          <span
            style="
              background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #667eea 100%);
              background-size: 200% auto;
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              animation: gradient-shift 2s linear infinite;
            "
          >
            正在生成中，请稍候...
          </span>
        </p>

        <!-- 加载点动画 -->
        <div style="display: flex; justify-content: center; gap: 8px; margin-top: 10px">
          <div
            style="
              width: 8px;
              height: 8px;
              background: #667eea;
              border-radius: 50%;
              animation: bounce 1.4s ease-in-out 0s infinite;
            "
          ></div>
          <div
            style="
              width: 8px;
              height: 8px;
              background: #667eea;
              border-radius: 50%;
              animation: bounce 1.4s ease-in-out 0.2s infinite;
            "
          ></div>
          <div
            style="
              width: 8px;
              height: 8px;
              background: #667eea;
              border-radius: 50%;
              animation: bounce 1.4s ease-in-out 0.4s infinite;
            "
          ></div>
        </div>

        <!-- 进度信息 -->
        <div
          v-if="progress"
          style="margin-top: 20px; padding: 15px; background: #1a1a1a; border-radius: 8px; border: 1px solid #444"
        >
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px">
            <span style="color: #667eea; font-size: 13px; font-weight: 600">
              步骤 {{ progress.step }}/{{ progress.total }}: {{ progress.stepName }}
            </span>
            <span style="color: #e0e0e0; font-size: 14px; font-weight: 700"> {{ progress.percentage }}% </span>
          </div>
          <div
            style="
              width: 100%;
              height: 6px;
              background: #333;
              border-radius: 3px;
              overflow: hidden;
              margin-bottom: 10px;
            "
          >
            <div
              style="
                height: 100%;
                background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
                transition: width 0.4s ease;
                box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
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
        </div>
      </div>

      <div style="display: flex; gap: 12px">
        <button
          v-if="!isGenerating"
          @click="handleConfirm"
          :disabled="showInput && !localInput"
          style="
            flex: 1;
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 10px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.2s;
          "
          :style="{ opacity: showInput && !localInput ? 0.5 : 1 }"
        >
          <i class="fa-solid fa-check"></i>
          确认生成
        </button>
        <button
          @click="handleClose"
          :disabled="isGenerating"
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
          :style="{ opacity: isGenerating ? 0.5 : 1 }"
        >
          {{ isGenerating ? '生成中...' : '取消' }}
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
  placeholder?: string;
  isGenerating?: boolean;
  showInput?: boolean; // 是否显示输入框
  progress?: ProgressInfo; // 进度信息
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'confirm', input?: string): void;
}>();

const localInput = ref('');

// 当对话框显示时，清空输入
watch(
  () => props.show,
  newVal => {
    if (newVal) {
      localInput.value = '';
    }
  },
);

const handleConfirm = () => {
  if (!props.isGenerating) {
    if (props.showInput) {
      emit('confirm', localInput.value);
    } else {
      emit('confirm');
    }
  }
};

const handleClose = () => {
  if (!props.isGenerating) {
    emit('close');
  }
};
</script>

<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.3);
    opacity: 0.7;
  }
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes gradient-shift {
  0% {
    background-position: 0% center;
  }
  100% {
    background-position: 200% center;
  }
}

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
</style>
