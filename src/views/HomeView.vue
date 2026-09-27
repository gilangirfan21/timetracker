<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import ActivityTile from '@/components/ActivityTile.vue'
import PageHeader from '@/components/PageHeader.vue'
import TagInput from '@/components/ui/TagInput.vue'
import { TAG_SUGGESTIONS } from '@/lib/tags'
import { useActivitiesStore } from '@/stores/activities'
import { useRunningStore } from '@/stores/running'

const activities = useActivitiesStore()
const running = useRunningStore()

const loading = ref(true)
const error = ref('')
const busyId = ref(null)
// Tags applied to the next timer you start, then cleared.
const nextTags = ref([])
const tagInput = ref(null)

// Active activities, plus archived ones that still have a timer running so it can be stopped.
const tiles = computed(() =>
  activities.items.filter((a) => !a.archived || running.byActivity[a.id]),
)

async function refresh() {
  try {
    await Promise.all([activities.load(), running.load()])
  } catch (e) {
    error.value = e.message
  }
}

// Pick up timers started/stopped on another device when coming back to the app.
function onVisible() {
  if (document.visibilityState === 'visible') running.load().catch((e) => (error.value = e.message))
}

onMounted(async () => {
  await refresh()
  loading.value = false
  document.addEventListener('visibilitychange', onVisible)
})
onBeforeUnmount(() => document.removeEventListener('visibilitychange', onVisible))

async function tap(activity) {
  error.value = ''
  busyId.value = activity.id
  try {
    const current = running.byActivity[activity.id]
    if (current) {
      await running.stop(current)
    } else {
      tagInput.value?.commitDraft()
      await running.start(activity.id, nextTags.value)
      nextTags.value = []
    }
  } catch (e) {
    error.value = e.message
  } finally {
    busyId.value = null
  }
}
</script>

<template>
  <PageHeader title="Timer" />

  <div class="space-y-4 px-4">
    <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
    <p v-if="loading" class="text-slate-500 dark:text-slate-400">Loading…</p>

    <template v-else>
      <div>
        <span class="label">Tags for next start (optional)</span>
        <TagInput ref="tagInput" v-model="nextTags" :suggestions="TAG_SUGGESTIONS" />
      </div>

      <p v-if="!tiles.length" class="py-8 text-center text-slate-500 dark:text-slate-400">
        No activities yet.
        <RouterLink to="/activities" class="font-medium text-indigo-600 dark:text-indigo-400">Add one</RouterLink>
      </p>

      <div v-else class="grid grid-cols-2 gap-3">
        <ActivityTile
          v-for="a in tiles"
          :key="a.id"
          :activity="a"
          :running="running.byActivity[a.id]"
          :busy="busyId === a.id"
          @tap="tap(a)"
        />
      </div>
    </template>
  </div>
</template>
