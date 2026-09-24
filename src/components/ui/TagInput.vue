<script setup>
import { ref } from 'vue'
import BaseIcon from '@/components/icons/BaseIcon.vue'

const tags = defineModel({ type: Array, default: () => [] })
defineProps({ suggestions: { type: Array, default: () => [] } })

const draft = ref('')

function has(tag) {
  return tags.value.some((t) => t.toLowerCase() === tag.toLowerCase())
}

function add(raw) {
  const tag = raw.trim()
  if (tag && !has(tag)) tags.value = [...tags.value, tag]
}

function remove(tag) {
  tags.value = tags.value.filter((t) => t.toLowerCase() !== tag.toLowerCase())
}

function toggle(tag) {
  has(tag) ? remove(tag) : add(tag)
}

function commitDraft() {
  draft.value.split(',').forEach(add)
  draft.value = ''
}

function onKeydown(e) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    commitDraft()
  } else if (e.key === 'Backspace' && !draft.value && tags.value.length) {
    tags.value = tags.value.slice(0, -1)
  }
}

// Parent can flush a typed-but-not-entered tag before saving.
defineExpose({ commitDraft })
</script>

<template>
  <div>
    <div
      class="flex min-h-12 flex-wrap items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
    >
      <span
        v-for="tag in tags"
        :key="tag"
        class="flex items-center gap-1 rounded-full bg-indigo-50 py-1 pr-1.5 pl-2.5 text-sm text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
      >
        {{ tag }}
        <button type="button" :aria-label="`Remove ${tag}`" @click="remove(tag)">
          <BaseIcon name="x" size="sm" />
        </button>
      </span>
      <input
        v-model="draft"
        type="text"
        enterkeyhint="done"
        :placeholder="tags.length ? '' : 'Add tag…'"
        class="min-w-24 flex-1 bg-transparent py-1 text-base outline-none"
        @keydown="onKeydown"
        @blur="commitDraft"
      />
    </div>
    <div v-if="suggestions.length" class="mt-2 flex flex-wrap gap-1.5">
      <button
        v-for="tag in suggestions"
        :key="tag"
        type="button"
        class="rounded-full border px-3 py-1.5 text-sm transition-colors"
        :class="
          has(tag)
            ? 'border-indigo-600 bg-indigo-600 text-white dark:border-indigo-500 dark:bg-indigo-500'
            : 'border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300'
        "
        @click="toggle(tag)"
      >
        {{ tag }}
      </button>
    </div>
  </div>
</template>
