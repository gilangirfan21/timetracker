<script setup>
import { computed, nextTick, ref } from 'vue'
import BaseIcon from '@/components/icons/BaseIcon.vue'
import { usePopover } from '@/composables/usePopover'

// options: [{ value, label, ...anything the #option slot needs }]
const model = defineModel({ type: [String, Number], default: '' })
const props = defineProps({
  options: { type: Array, required: true },
  placeholder: { type: String, default: 'Select…' },
  compact: { type: Boolean, default: false },
  // Adds a text filter at the top of the panel so long lists can be typed to find.
  searchable: { type: Boolean, default: false },
})

const { isOpen, trigger, panel, style, toggle: togglePopover, close: closePopover } = usePopover({ height: 264 })

const query = ref('')
const searchInput = ref(null)

const selected = computed(() => props.options.find((o) => o.value === model.value) ?? null)

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!props.searchable || !q) return props.options
  return props.options.filter((o) => o.label.toLowerCase().includes(q))
})

async function toggle() {
  togglePopover()
  if (!isOpen.value) return
  query.value = ''
  if (props.searchable) {
    await nextTick()
    searchInput.value?.focus()
  }
}

function close() {
  closePopover()
  query.value = ''
}

function pick(value) {
  model.value = value
  close()
}

function pickFirst() {
  if (filtered.value.length) pick(filtered.value[0].value)
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
    <div v-if="isOpen" ref="panel" :style="style" class="popover flex max-h-64 min-w-48 flex-col overflow-hidden p-2">
      <input
        v-if="searchable"
        ref="searchInput"
        v-model="query"
        type="text"
        placeholder="Type to search…"
        class="field mb-1.5 shrink-0"
        @keydown.escape="close"
        @keydown.enter.prevent="pickFirst"
      />
      <ul class="min-h-0 overflow-y-auto">
        <li v-for="opt in filtered" :key="opt.value">
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
        <li v-if="searchable && !filtered.length" class="px-3 py-2.5 text-sm text-slate-500 dark:text-slate-400">
          No matches.
        </li>
      </ul>
    </div>
  </Teleport>
</template>
