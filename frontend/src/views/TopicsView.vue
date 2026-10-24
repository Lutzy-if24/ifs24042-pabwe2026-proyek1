<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { api } from '../services/api';

const topics = ref([]);
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    const list = (await api.get('/topics')).data;
    // Ambil daftar materi tiap topik
    topics.value = await Promise.all(list.map(async (t) => (await api.get(`/topics/${t.id}`)).data));
    topics.value.forEach((t, i) => { t.problem_count = list[i].problem_count; });
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <h1>Materi</h1>
  <p class="muted">Pilih topik, lalu baca materi dan kerjakan soal latihannya.</p>
  <p v-if="loading" class="muted">Memuat…</p>
  <div v-if="error" class="alert alert-error">{{ error }}</div>

  <div class="grid grid-2">
    <div v-for="t in topics" :key="t.id" class="card">
      <h3>{{ t.name }}</h3>
      <p class="muted">{{ t.description }}</p>
      <ul>
        <li v-for="m in t.materials" :key="m.id">
          <!-- PERBAIKAN: Menambahkan style underline pada link materi -->
          <RouterLink :to="`/materi/${m.id}`" style="text-decoration: underline;">{{ m.title }}</RouterLink>
        </li>
      </ul>
      <!-- PERBAIKAN: style text-decoration: none agar tombol tidak bergaris bawah -->
      <RouterLink :to="`/soal?topic=${t.id}`" class="btn btn-outline btn-sm" style="text-decoration: none;">
        Latihan {{ t.problem_count }} soal
      </RouterLink>
    </div>
  </div>
</template>