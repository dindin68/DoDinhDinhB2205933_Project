<template>
    <div class="page">
        <h2>Yêu cầu mượn</h2>
        <div v-if="!book">Đang tải sách...</div>
        <div v-else>
            <p>Đang mượn: {{ book.TenSach || book.title }}</p>
            <form @submit.prevent="submit">
                <div>
                    <label>Ngày mượn</label>
                    <input type="date" v-model="form.NgayMuon" required />
                </div>
                <div>
                    <label>Ngày trả dự kiến</label>
                    <input type="date" v-model="form.NgayTra" required />
                </div>
                <button>Gửi yêu cầu</button>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const book = ref(null)
const form = ref({ NgayMuon: '', NgayTra: '' })

onMounted(async () => {
    try {
        const res = await api.get(`/books/${route.params.bookId}`)
        book.value = res.data
    } catch (e) { }
})

// Require reader login: if no reader_token, redirect to login
onMounted(() => {
    const token = localStorage.getItem('reader_token')
    if (!token) {
        // send user to reader login
        router.push('/login')
    }
})

const submit = async () => {
    try {
        // basic payload. Backend now requires Authorization Bearer token (reader_token)
        await api.post('/borrowings', { MaSach: book.value.MaSach || book.value._id, NgayMuon: form.value.NgayMuon, NgayTra: form.value.NgayTra })
        alert('Yêu cầu mượn đã gửi')
        router.push('/my-borrowings')
    } catch (e) {
        console.error('Borrow submit error', e)
        if (e?.response?.status === 401) {
            alert('Bạn cần đăng nhập để mượn sách')
            router.push('/login')
            return
        }
        alert(e?.response?.data?.message || 'Lỗi gửi yêu cầu')
    }
}
</script>

<style scoped>
.page {
    max-width: 700px;
    margin: 24px auto
}

input {
    width: 100%;
    padding: 8px;
    margin: 6px 0
}

button {
    padding: 8px 12px;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 4px
}
</style>
