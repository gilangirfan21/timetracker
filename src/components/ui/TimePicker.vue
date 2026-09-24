<script setup>
import { nextTick } from 'vue'
import BaseIcon from '@/components/icons/BaseIcon.vue'
import { usePopover } from '@/composables/usePopover'

// Value is a dayjs; emits { hour, minute }.
const props = defineProps({ value: { type: Object, required: true } })
const emit = defineEmits(['pick'])

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = Array.from({ length: 60 }, (_, i) => i)
const pad = (n) => String(n).padStart(2, '0')

const { isOpen, trigger, panel, style, toggle, close } = usePopover({ width: 176, height: 256 })

async function onToggle() {
  toggle()
  if (!isOpen.value) return
  await nextTick()
  // Center the current hour/minute in each column.
  panel.value?.querySelectorAll('[data-active]').forEach((el) => el.scrollIntoView({ block: 'center' }))
}

function pickHour(hour) {
  emit('pick', { hour, minute: props.value.minute() })
}

function pickMinute(minute) {
  emit('pick', { hour: props.value.hour(), minute })
  close()
}
</script>

<template>
  <button ref="trigger" type="button" class="field-btn" :aria-expanded="isOpen" @click="onToggle">
    <span class="tabular-nums">{{ value.format('HH:mm') }}</span>
    <BaseIcon name="clock" size="md" class="shrink-0 text-slate-400" />
  </button>

  <Teleport to="body">
    <div v-if="isOpen" ref="panel" :style="style" class="popover grid h-64 grid-cols-2 gap-1">
      <ul v-for="col in [{ list: HOURS, current: value.hour(), pick: pickHour }, { list: MINUTES, current: value.minute(), pick: pickMinute }]" :key="col.list.length" class="overflow-y-auto">
        <li v-for="n in col.list" :key="n">
          <button
            type="button"
            class="w-full rounded-lg py-2 text-center text-sm tabular-nums transition-colors"
            :class="
              n === col.current
                ? 'bg-indigo-600 font-semibold text-white dark:bg-indigo-500'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            "
            :data-active="n === col.current || undefined"
            @click="col.pick(n)"
          >
            {{ pad(n) }}
          </button>
        </li>
      </ul>
    </div>
  </Teleport>
</template>
