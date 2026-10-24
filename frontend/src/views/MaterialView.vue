<script setup>
import { ref, watch } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { api } from '../services/api';
import MarkdownView from '../components/MarkdownView.vue';

const route = useRoute();
const material = ref(null);
const error = ref('');

async function load() {
  material.value = null;
  error.value = '';
  try {
    material.value = (await api.get(`/materials/${route.params.id}`)).data;
  } catch (e) {
    error.value = e.status === 404 ? 'Materi tidak ditemukan.' : e.message;
  }
}
watch(() => route.params.id, load, { immediate: true });
</script>

<template>
  <!-- PERBAIKAN: Tambahkan style underline pada link "Semua materi" -->
  <RouterLink to="/materi" style="text-decoration: underline;">← Semua materi</RouterLink>
  
  <div v-if="error" class="alert alert-error">{{ error }}</div>
  <p v-else-if="!material" class="muted">Memuat…</p>
  
  <article v-else class="card mt">
    <!-- PERBAIKAN: Tambahkan h1 (secara visual bisa disembunyikan, tapi dibaca oleh mesin) -->
    <h1 class="sr-only">Materi: {{ material.topic }}</h1>
    
    <span class="badge">{{ material.topic }}</span>
    <MarkdownView :source="material.content_md" />
    <RouterLink :to="`/soal?topic=${material.topic_id}`" class="btn mt" style="text-decoration: none;">Latihan soal {{ material.topic }}</RouterLink>
  </article>
</template>