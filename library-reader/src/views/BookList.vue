<template>
    <div class="page">
        <h1>Danh sách sách</h1>
        <div v-if="loading">Đang tải...</div>
        <div v-else>
            <ul>
                <li v-for="b in books" :key="b._id">
                    <router-link :to="`/books/${b._id}`">{{ b.TenSach || b.title }} - {{ b.MaSach || b.code
                        }}</router-link>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'

const books = ref([])
const loading = ref(true)

const load = async () => {
    loading.value = true
    try {
        const res = await api.get('/books')
        books.value = res.data || []
    } catch (e) {
        console.error(e)
        alert('Lỗi khi tải sách')
    } finally {
        loading.value = false
    }
}

onMounted(load)
</script>

<style scoped>
.page {
    max-width: 900px;
    margin: 32px auto;
    padding: 16px
}

ul {
    list-style: none;
    padding: 0
}

li {
    padding: 8px 0
}
</style>
