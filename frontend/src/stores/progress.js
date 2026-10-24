import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '../services/api';

export const useProgressStore = defineStore('progress', () => {
  const doneIds = ref([]);
  const byTopic = ref([]);
  const summary = ref({ completed: 0, total: 0, percent: 0 });

  const isDone = (id) => doneIds.value.includes(id);

  async function load() {
    try {
      const { data } = await api.get('/progress');
      doneIds.value = data.completed_problem_ids;
      byTopic.value = data.by_topic;
      summary.value = data.summary;
    } catch {
      /* gagal memuat progres tidak boleh merusak halaman lain */
    }
  }

  // Tandai selesai / batalkan, lalu muat ulang ringkasan
  async function toggle(problemId) {
    if (isDone(problemId)) await api.del(`/progress/${problemId}`);
    else await api.post(`/progress/${problemId}`);
    await load();
  }

  function reset() {
    doneIds.value = [];
    byTopic.value = [];
    summary.value = { completed: 0, total: 0, percent: 0 };
  }

  return { doneIds, byTopic, summary, isDone, load, toggle, reset };
});
