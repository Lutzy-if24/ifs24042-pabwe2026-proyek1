<script setup>
import { ref, watch } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { api } from '../services/api';
import { useAuthStore } from '../stores/auth';
import { useProgressStore } from '../stores/progress';
import MarkdownView from '../components/MarkdownView.vue';

const route = useRoute();
const auth = useAuthStore();
const progress = useProgressStore();

const problem = ref(null);
const solution = ref(null);
const showSolution = ref(false);
const solLoading = ref(false);
const error = ref('');
const actionError = ref('');

async function load() {
  problem.value = null;
  solution.value = null;
  showSolution.value = false;
  error.value = '';
  try {
    problem.value = (await api.get(`/problems/${route.params.id}`)).data;
  } catch (e) {
    error.value = e.status === 404 ? 'Soal tidak ditemukan.' : e.message;
  }
}
watch(() => route.params.id, load, { immediate: true });

// Pembahasan baru diambil dari server saat tombol pertama kali diklik
async function toggleSolution() {
  if (showSolution.value) { showSolution.value = false; return; }
  if (!solution.value) {
    solLoading.value = true;
    actionError.value = '';
    try {
      solution.value = (await api.get(`/problems/${problem.value.id}/solution`)).data;
    } catch (e) {
      actionError.value = e.message;
      solLoading.value = false;
      return;
    }
    solLoading.value = false;
  }
  showSolution.value = true;
}

async function toggleDone() {
  actionError.value = '';
  try {
    await progress.toggle(problem.value.id);
  } catch (e) {
    actionError.value = e.message;
  }
}
</script>

<template>
  <RouterLink to="/soal">← Semua soal</RouterLink>
  <div v-if="error" class="alert alert-error">{{ error }}</div>
  <p v-else-if="!problem" class="muted">Memuat…</p>

  <template v-else>
    <article class="card mt">
      <h1>{{ problem.title }}</h1>
      <div class="badges">
        <span class="badge">{{ problem.topic }}</span>
        <span class="badge" :class="`badge-${problem.level.toLowerCase()}`">{{ problem.level }}</span>
        <span v-if="problem.competition" class="badge badge-comp">{{ problem.competition }}</span>
      </div>
      <MarkdownView :source="problem.statement_md" />
      <div class="tag">{{ problem.tags.map((t) => '#' + t).join(' ') }}</div>
    </article>

    <div class="mt">
      <button v-if="problem.has_solution" class="btn" :disabled="solLoading" @click="toggleSolution">
        {{ showSolution ? 'Sembunyikan Pembahasan' : solLoading ? 'Memuat…' : 'Lihat Pembahasan' }}
      </button>
      <span v-else class="muted">Pembahasan belum tersedia.</span>

      <template v-if="auth.isLoggedIn">
        <button
          class="btn btn-sm"
          :class="progress.isDone(problem.id) ? 'btn-done' : 'btn-outline'"
          style="margin-left: .5rem"
          @click="toggleDone"
        >
          {{ progress.isDone(problem.id) ? '✓ Selesai (klik untuk batalkan)' : 'Tandai selesai' }}
        </button>
      </template>
      <p v-else class="muted">
        <!-- PERBAIKAN: Menambahkan text-decoration underline pada link Masuk -->
        <RouterLink :to="{ name: 'login', query: { redirect: route.fullPath } }" style="text-decoration: underline;">Masuk</RouterLink>
        untuk menandai soal ini sebagai selesai.
      </p>
    </div>

    <div v-if="actionError" class="alert alert-error">{{ actionError }}</div>

    <section v-if="showSolution && solution" class="card solution-box mt">
      <h2>Pembahasan</h2>
      <MarkdownView :source="solution.content_md" />
    </section>
  </template>
</template>