<template>
    <div class="page">
        <h2>Yêu cầu mượn của tôi</h2>
        <div v-if="loading">Đang tải...</div>
        <div v-else>
            <ul>
                <li v-for="b in items" :key="b._id">
                    <div>{{ b.MaMuon || b._id }} - {{ b.MaSach }}</div>
                    <div>Trạng thái: {{ b.TrangThai || b.status || 'Chưa cập nhật' }}</div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'

const items = ref([])
const loading = ref(false)

const load = async () => {
    loading.value = true
    try {
        const res = await api.get('/borrowings')
        items.value = res.data || []
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

onMounted(load)
</script>

<style scoped>
.page {
    max-width: 800px;
    margin: 24px auto
}

ul {
    list-style: none;
    padding: 0
}

li {
    padding: 8px 0;
    border-bottom: 1px solid #eee
}
</style>
