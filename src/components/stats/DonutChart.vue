<script setup>
import { ArcElement, Chart, DoughnutController, Tooltip } from 'chart.js'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { formatHours } from '@/lib/time'

Chart.register(DoughnutController, ArcElement, Tooltip)

// items: [{ label, value (ms), color }]
const props = defineProps({ items: { type: Array, required: true } })

const canvas = ref(null)
let chart = null

function data() {
  return {
    labels: props.items.map((i) => i.label),
    datasets: [
      {
        data: props.items.map((i) => i.value),
        backgroundColor: props.items.map((i) => i.color),
        borderWidth: 0,
        spacing: 2,
      },
    ],
  }
}

onMounted(() => {
  chart = new Chart(canvas.value, {
    type: 'doughnut',
    data: data(),
    options: {
      cutout: '65%',
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx) => ` ${formatHours(ctx.raw)}` } },
      },
    },
  })
})

watch(
  () => props.items,
  () => {
    if (!chart) return
    chart.data = data()
    chart.update()
  },
)

onBeforeUnmount(() => chart?.destroy())
</script>

<template>
  <div class="relative h-52">
    <canvas ref="canvas" />
    <div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
      <slot />
    </div>
  </div>
</template>
