<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { api } from '../services/api';
import ProblemCard from '../components/ProblemCard.vue';

const topics = ref([]);
const latest = ref([]);
const error = ref('');

onMounted(async () => {
  try {
    const [t, p] = await Promise.all([
      api.get('/topics'),
      api.get('/problems?sort=latest&limit=5'),
    ]);
    topics.value = t.data;
    latest.value = p.data;
  } catch (e) {
    error.value = e.message;
  }
});
</script>

<template>
  <section class="hero">
    <h1>Belajar Olimpiade Matematika</h1>
    <p>
      Materi ringkas, soal bergaya OSN/KSN, dan pembahasan langkah demi langkah untuk Aljabar,
      Geometri, Teori Bilangan, dan Kombinatorika. Daftar untuk melacak progres belajarmu.
    </p>
    <RouterLink to="/soal" class="btn" style="text-decoration: none;">Mulai Latihan Soal</RouterLink>
    <RouterLink to="/materi" class="btn btn-outline" style="text-decoration: none;">Baca Materi</RouterLink>
  </section>

  <div v-if="error" class="alert alert-error">{{ error }}</div>

  <h2 class="mt">Topik Unggulan</h2>
  <div class="grid grid-2">
    <div v-for="t in topics" :key="t.id" class="card">
      <h3>{{ t.name }}</h3>
      <p class="muted">{{ t.description }}</p>
      <p class="tag">{{ t.problem_count }} soal · {{ t.material_count }} materi</p>
      <!-- PERBAIKAN: Tambahkan style underline pada link "Lihat soal" -->
      <RouterLink :to="`/soal?topic=${t.id}`" style="text-decoration: underline;">Lihat soal →</RouterLink>
    </div>
  </div>

  <h2 class="mt">Soal Terbaru</h2>
  <div class="grid grid-2">
    <ProblemCard v-for="p in latest" :key="p.id" :problem="p" />
  </div>
</template>