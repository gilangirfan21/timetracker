<script setup>
import { onMounted, ref } from 'vue'
import ActivityForm from '@/components/ActivityForm.vue'
import ActivityIcon from '@/components/ActivityIcon.vue'
import FloatingAddButton from '@/components/FloatingAddButton.vue'
import BaseIcon from '@/components/icons/BaseIcon.vue'
import PageHeader from '@/components/PageHeader.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import { useActivitiesStore } from '@/stores/activities'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const activities = useActivitiesStore()

const error = ref('')
const loading = ref(true)
const showArchived = ref(false)
// null = closed, {} = new, activity object = editing
const editing = ref(null)

onMounted(async () => {
  try {
    await activities.load()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

async function save(payload) {
  if (editing.value.id) await activities.update(editing.value.id, payload)
  else await activities.create(payload)
  editing.value = null
}

async function run(action) {
  error.value = ''
  try {
    await action()
  } catch (e) {
    error.value = e.message
  }
}

function logout() {
  run(() => auth.signOut())
}
</script>

<template>
  <PageHeader title="Activities">
    <button type="button" class="icon-btn hover:!text-red-600 dark:hover:!text-red-400" aria-label="Log out" @click="logout">
      <BaseIcon name="logout" size="md" />
    </button>
  </PageHeader>

  <!-- Extra bottom padding so the last row isn't hidden behind the floating button. -->
  <div class="space-y-4 px-4 pb-20">
    <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
    <p v-if="loading" class="text-slate-500 dark:text-slate-400">Loading…</p>

    <template v-else>
      <p v-if="!activities.active.length" class="py-8 text-center text-slate-500 dark:text-slate-400">
        No activities yet. Tap + to add one.
      </p>

      <ul
        v-else
        class="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900"
      >
        <li v-for="a in activities.active" :key="a.id" class="flex items-center gap-3 px-3 py-2.5">
          <ActivityIcon :activity="a" />
          <span class="flex-1 truncate font-medium">{{ a.name }}</span>
          <button type="button" class="icon-btn" :aria-label="`Edit ${a.name}`" @click="editing = a">
            <BaseIcon name="pencil" size="md" />
          </button>
          <button
            type="button"
            class="icon-btn"
            :aria-label="`Archive ${a.name}`"
            @click="run(() => activities.archive(a.id))"
          >
            <BaseIcon name="archive-box" size="md" />
          </button>
        </li>
      </ul>

      <div v-if="activities.archived.length">
        <button
          type="button"
          class="py-2 text-sm font-medium text-slate-500 dark:text-slate-400"
          @click="showArchived = !showArchived"
        >
          {{ showArchived ? 'Hide' : 'Show' }} archived ({{ activities.archived.length }})
        </button>
        <ul v-if="showArchived" class="space-y-1">
          <li v-for="a in activities.archived" :key="a.id" class="flex items-center gap-3 px-3 py-2 opacity-60">
            <ActivityIcon :activity="a" size="sm" />
            <span class="flex-1 truncate">{{ a.name }}</span>
            <button
              type="button"
              class="icon-btn"
              :aria-label="`Restore ${a.name}`"
              @click="run(() => activities.unarchive(a.id))"
            >
              <BaseIcon name="arrow-uturn-left" size="md" />
            </button>
          </li>
        </ul>
      </div>

      <p class="pt-4 text-center text-xs text-slate-400 dark:text-slate-500">Logged in as {{ auth.user?.email }}</p>
    </template>
  </div>

  <FloatingAddButton label="Add activity" @click="editing = {}" />

  <BaseModal v-if="editing" :title="editing.id ? 'Edit activity' : 'New activity'" @close="editing = null">
    <ActivityForm :activity="editing.id ? editing : null" :save="save" @cancel="editing = null" />
  </BaseModal>
</template>
