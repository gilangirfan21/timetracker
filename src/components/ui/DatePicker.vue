<script setup>
import { computed, ref } from 'vue'
import BaseIcon from '@/components/icons/BaseIcon.vue'
import { usePopover } from '@/composables/usePopover'
import { local } from '@/lib/time'

// Value is a dayjs (in app TZ); emits the picked day (start of day).
const props = defineProps({ value: { type: Object, required: true } })
const emit = defineEmits(['pick'])

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const { isOpen, trigger, panel, style, toggle, close } = usePopover({ width: 288, height: 340 })

const view = ref(props.value.startOf('month'))
const today = local()

const cells = computed(() => {
  const offset = (view.value.day() + 6) % 7 // Monday first
  const list = Array(offset).fill(null)
  for (let d = 1; d <= view.value.daysInMonth(); d++) list.push(view.value.date(d))
  return list
})

function onToggle() {
  view.value = props.value.startOf('month')
  toggle()
}

function pick(day) {
  emit('pick', day)
  close()
}
</script>

<template>
  <button ref="trigger" type="button" class="field-btn" :aria-expanded="isOpen" @click="onToggle">
    <span class="truncate">{{ value.format('ddd, D MMM YYYY') }}</span>
    <BaseIcon name="calendar" size="md" class="shrink-0 text-slate-400" />
  </button>

  <Teleport to="body">
    <div v-if="isOpen" ref="panel" :style="style" class="popover p-3">
      <div class="mb-2 flex items-center justify-between">
        <button type="button" class="icon-btn !h-8 !w-8" aria-label="Previous month" @click="view = view.subtract(1, 'month')">
          <BaseIcon name="chevron-left" size="sm" />
        </button>
        <span class="text-sm font-semibold">{{ view.format('MMMM YYYY') }}</span>
        <button type="button" class="icon-btn !h-8 !w-8" aria-label="Next month" @click="view = view.add(1, 'month')">
          <BaseIcon name="chevron-right" size="sm" />
        </button>
      </div>

      <div class="grid grid-cols-7 gap-1 text-center text-xs text-slate-400 dark:text-slate-500">
        <span v-for="d in WEEKDAYS" :key="d" class="py-1">{{ d }}</span>
      </div>
      <div class="grid grid-cols-7 gap-1">
        <template v-for="(day, i) in cells" :key="i">
          <span v-if="!day" />
          <button
            v-else
            type="button"
            class="flex aspect-square items-center justify-center rounded-lg text-sm transition-colors"
            :class="
              day.isSame(value, 'day')
                ? 'bg-indigo-600 font-semibold text-white dark:bg-indigo-500'
                : day.isSame(today, 'day')
                  ? 'font-semibold text-indigo-600 hover:bg-slate-100 dark:text-indigo-400 dark:hover:bg-slate-800'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            "
            @click="pick(day)"
          >
            {{ day.date() }}
          </button>
        </template>
      </div>

      <div class="mt-2 border-t border-slate-100 pt-2 dark:border-slate-800">
        <button
          type="button"
          class="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          @click="pick(today.startOf('day'))"
        >
          Today
        </button>
      </div>
    </div>
  </Teleport>
</template>
