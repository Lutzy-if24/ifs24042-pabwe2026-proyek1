<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from '../services/api';
import ProblemCard from '../components/ProblemCard.vue';
import Pagination from '../components/Pagination.vue';

const route = useRoute();
const router = useRouter();

const topics = ref([]);
const levels = ref([]);
const competitions = ref([]);
const problems = ref([]);
const meta = ref(null);
const loading = ref(false);
const error = ref('');

// Nilai filter disimpan di query URL, jadi bisa di-bookmark dan tombol Back berfungsi
const form = reactive({ topic: '', level: '', competition: '', q: '' });
const KEYS = ['topic', 'level', 'competition', 'q'];

function syncForm() {
  KEYS.forEach((k) => { form[k] = route.query[k] ? String(route.query[k]) : ''; });
}

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const params = new URLSearchParams({ limit: '8' });
    [...KEYS, 'page'].forEach((k) => { if (route.query[k]) params.set(k, route.query[k]); });
    const res = await api.get(`/problems?${params}`);
    problems.value = res.data;
    meta.value = res.meta;
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}

// Terapkan filter (halaman otomatis kembali ke 1)
function apply() {
  const query = {};
  KEYS.forEach((k) => { if (form[k]) query[k] = form[k]; });
  router.push({ query });
}
const reset = () => router.push({ query: {} });
const goPage = (p) => router.push({ query: { ...route.query, page: p } });

watch(() => route.query, () => { syncForm(); load(); }, { immediate: true });

onMounted(async () => {
  try {
    const [t, l, c] = await Promise.all([api.get('/topics'), api.get('/levels'), api.get('/competitions')]);
    topics.value = t.data;
    levels.value = l.data;
    competitions.value = c.data;
  } catch (e) {
    error.value = e.message;
  }
});
</script>

<template>
  <h1>Daftar Soal</h1>

  <form class="card filters" @submit.prevent="apply">
    <div>
      <label for="f-topic">Topik</label>
      <select id="f-topic" v-model="form.topic" @change="apply">
        <option value="">Semua</option>
        <option v-for="t in topics" :key="t.id" :value="String(t.id)">{{ t.name }}</option>
      </select>
    </div>
    <div>
      <label for="f-level">Tingkat</label>
      <select id="f-level" v-model="form.level" @change="apply">
        <option value="">Semua</option>
        <option v-for="l in levels" :key="l.id" :value="String(l.id)">{{ l.name }}</option>
      </select>
    </div>
    <div>
      <label for="f-comp">Kompetisi</label>
      <select id="f-comp" v-model="form.competition" @change="apply">
        <option value="">Semua</option>
        <option v-for="c in competitions" :key="c.id" :value="String(c.id)">{{ c.name }}</option>
      </select>
    </div>
    <div class="search-row">
      <input v-model="form.q" type="search" placeholder="Cari kata kunci, mis. faktor, segitiga…" />
      <button type="submit" class="btn">Cari</button>
      <button type="button" class="btn btn-outline" @click="reset">Reset</button>
    </div>
  </form>

  <div v-if="error" class="alert alert-error">{{ error }}</div>
  <p v-if="loading" class="muted mt">Memuat…</p>
  <p v-else-if="meta" class="muted mt">{{ meta.total }} soal ditemukan</p>

  <div class="grid grid-2">
    <ProblemCard v-for="p in problems" :key="p.id" :problem="p" />
  </div>
  <p v-if="!loading && meta && meta.total === 0" class="alert alert-info">
    Tidak ada soal yang cocok dengan filter. Coba ubah atau reset filter.
  </p>

  <Pagination v-if="meta" :page="meta.page" :total-pages="meta.totalPages" @change="goPage" />
</template>
