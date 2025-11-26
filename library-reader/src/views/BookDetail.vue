<template>
    <div class="page">
        <button @click="$router.back()">Quay lại</button>
        <div v-if="loading">Đang tải...</div>
        <div v-else-if="book">
            <h2>{{ book.TenSach || book.title }}</h2>
            <div v-if="book.ImageUrl" style="margin:12px 0">
                <img :src="book.ImageUrl" alt="book" style="max-width:220px; border-radius:6px;" />
            </div>
            <p> Mã: {{ book.MaSach || book.code }}</p>
            <p> Tác giả: {{ book.TacGia || book.author }}</p>
            <p> Mô tả: {{ book.MoTa || book.description }}</p>
            <router-link :to="`/borrow/${book._id}`">Mượn sách này</router-link>
        </div>
        <div v-else>Không tìm thấy sách</div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'
import { useRoute } from 'vue-router'

const route = useRoute()
const book = ref(null)
const loading = ref(false)

const load = async () => {
    loading.value = true
    try {
        const res = await api.get(`/books/${route.params.id}`)
        book.value = res.data
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
</style>
