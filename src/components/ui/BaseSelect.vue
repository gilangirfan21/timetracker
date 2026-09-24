<script setup>
import { computed } from 'vue'
import BaseIcon from '@/components/icons/BaseIcon.vue'
import { usePopover } from '@/composables/usePopover'

// options: [{ value, label, ...anything the #option slot needs }]
const model = defineModel({ type: [String, Number], default: '' })
const props = defineProps({
  options: { type: Array, required: true },
  placeholder: { type: String, default: 'Select…' },
  compact: { type: Boolean, default: false },
})

const { isOpen, trigger, panel, style, toggle, close } = usePopover({ height: 264 })

const selected = computed(() => props.options.find((o) => o.value === model.value) ?? null)

function pick(value) {
  model.value = value
  close()
}
</script>

<template>
  <button
    ref="trigger"
    type="button"
    :class="
      compact
        ? 'flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-sm transition-colors hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-600'
        : 'field-btn'
    "
    :aria-expanded="isOpen"
    @click="toggle"
    @keydown.escape="close"
  >
    <span class="flex min-w-0 items-center gap-2.5 truncate" :class="{ 'text-slate-400 dark:text-slate-500': !selected }">
      <slot v-if="selected" name="option" :option="selected">{{ selected.label }}</slot>
      <template v-else>{{ placeholder }}</template>
    </span>
    <BaseIcon
      name="chevron-down"
      size="sm"
      class="shrink-0 text-slate-400 transition-transform"
      :class="{ 'rotate-180': isOpen }"
    />
  </button>

  <Teleport to="body">
    <ul v-if="isOpen" ref="panel" :style="style" class="popover max-h-64 min-w-48 overflow-y-auto">
      <li v-for="opt in options" :key="opt.value">
        <button
          type="button"
          class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-base transition-colors"
          :class="
            opt.value === model
              ? 'bg-indigo-600 text-white dark:bg-indigo-500'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800'
          "
          @click="pick(opt.value)"
        >
          <slot name="option" :option="opt" :active="opt.value === model">{{ opt.label }}</slot>
        </button>
      </li>
    </ul>
  </Teleport>
</template>
