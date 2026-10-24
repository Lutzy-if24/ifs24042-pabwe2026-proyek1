<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { api } from '../services/api';
import { useProgressStore } from '../stores/progress';

const progress = useProgressStore();
const completed = ref([]);
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    await progress.load();
    const res = await api.get('/problems?limit=50&sort=oldest');
    completed.value = res.data.filter((p) => progress.isDone(p.id));
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <h1>Progres Belajar</h1>
  <div v-if="error" class="alert alert-error">{{ error }}</div>

  <div class="card">
    <!-- PERBAIKAN: Mengubah h3 menjadi h2 -->
    <h2>Keseluruhan: {{ progress.summary.completed }} dari {{ progress.summary.total }} soal ({{ progress.summary.percent }}%)</h2>
    <div class="bar bar-big"><span :style="{ width: progress.summary.percent + '%' }"></span></div>
  </div>

  <h2 class="mt">Per Topik</h2>
  <div class="grid grid-2">
    <div v-for="t in progress.byTopic" :key="t.topic_id" class="card">
      <h3>{{ t.topic }}</h3>
      <div class="bar"><span :style="{ width: t.percent + '%' }"></span></div>
      <p class="muted">{{ t.completed }} / {{ t.total }} soal · {{ t.percent }}%</p>
      <!-- PERBAIKAN: Tambahkan style underline pada link -->
      <RouterLink :to="`/soal?topic=${t.topic_id}`" style="text-decoration: underline;">Kerjakan soal →</RouterLink>
    </div>
  </div>

  <h2 class="mt">Soal yang Sudah Selesai</h2>
  <p v-if="loading" class="muted">Memuat…</p>
  <p v-else-if="!completed.length" class="alert alert-info">
    Belum ada soal yang diselesaikan. 
    <!-- PERBAIKAN: Tambahkan style underline pada link -->
    <RouterLink to="/soal" style="text-decoration: underline;">Mulai dari daftar soal</RouterLink>.
  </p>
  <div class="grid grid-2">
    <div v-for="p in completed" :key="p.id" class="card">
      <!-- PERBAIKAN: Tambahkan style underline pada link -->
      <RouterLink :to="`/soal/${p.id}`" style="text-decoration: underline;">{{ p.title }}</RouterLink>
      <div class="badges">
        <span class="badge">{{ p.topic }}</span>
        <span class="badge" :class="`badge-${p.level.toLowerCase()}`">{{ p.level }}</span>
      </div>
    </div>
  </div>
</template>