<template>
  <div
    v-if="visible"
    :style="{
      background: `linear-gradient(135deg, ${bgColorStart}, ${bgColorEnd})`,
      border: `1px solid ${borderColor}`,
      borderRadius: '12px',
      padding: '16px 20px',
      marginBottom: '20px',
    }"
  >
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px">
      <h4
        :style="{ color: titleColor, fontSize: '15px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }"
      >
        <i :class="icon"></i>
        {{ title }}
      </h4>
      <button
        style="background: transparent; border: none; color: #888; cursor: pointer; font-size: 14px; padding: 4px 8px"
        title="不再显示"
        @click="hide"
      >
        <i class="fa-solid fa-times"></i>
      </button>
    </div>
    <div style="display: flex; gap: 16px; flex-wrap: wrap">
      <div v-for="(step, index) in steps" :key="index" style="flex: 1; min-width: 140px">
        <div
          :style="{
            color: stepColors[index % stepColors.length],
            fontSize: '20px',
            fontWeight: 'bold',
            marginBottom: '4px',
          }"
        >
          {{ stepNumbers[index] }}
        </div>
        <div style="color: #e0e0e0; font-size: 13px; font-weight: 500">{{ step.title }}</div>
        <div style="color: #888; font-size: 11px">{{ step.desc }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

interface Step {
  title: string;
  desc: string;
}

const props = withDefaults(
  defineProps<{
    storageKey: string;
    title: string;
    icon?: string;
    steps: Step[];
    theme?: 'green' | 'blue' | 'purple' | 'orange';
  }>(),
  {
    icon: 'fa-solid fa-lightbulb',
    theme: 'green',
  },
);

const themeColors = {
  green: {
    bgStart: 'rgba(16, 185, 129, 0.1)',
    bgEnd: 'rgba(5, 150, 105, 0.15)',
    border: 'rgba(16, 185, 129, 0.3)',
    title: '#10b981',
  },
  blue: {
    bgStart: 'rgba(59, 130, 246, 0.1)',
    bgEnd: 'rgba(37, 99, 235, 0.15)',
    border: 'rgba(59, 130, 246, 0.3)',
    title: '#3b82f6',
  },
  purple: {
    bgStart: 'rgba(139, 92, 246, 0.1)',
    bgEnd: 'rgba(109, 40, 217, 0.15)',
    border: 'rgba(139, 92, 246, 0.3)',
    title: '#8b5cf6',
  },
  orange: {
    bgStart: 'rgba(251, 146, 60, 0.1)',
    bgEnd: 'rgba(234, 88, 12, 0.15)',
    border: 'rgba(251, 146, 60, 0.3)',
    title: '#f97316',
  },
};

const stepColors = ['#10b981', '#fbbf24', '#8b5cf6', '#3b82f6', '#f97316'];
const stepNumbers = ['①', '②', '③', '④', '⑤'];

const colors = themeColors[props.theme];
const bgColorStart = colors.bgStart;
const bgColorEnd = colors.bgEnd;
const borderColor = colors.border;
const titleColor = colors.title;

const visible = ref(true);

onMounted(() => {
  const hidden = localStorage.getItem(props.storageKey);
  visible.value = !hidden;
});

function hide() {
  visible.value = false;
  localStorage.setItem(props.storageKey, 'true');
}
</script>
