<template>
    <div class="container mt-5">
        <div class="card shadow-lg border-0">
            <div class="card-header bg-primary text-white">
                <h3 class="mb-0">{{ isEdit ? 'Sửa Sách' : 'Thêm Sách Mới' }}</h3>
            </div>
            <div class="card-body p-5">
                <form @submit.prevent="saveBook">
                    <div class="form-group mb-4">
                        <label class="font-weight-bold">Mã sách</label>
                        <input v-model="book.MaSach" type="text" class="form-control form-control-lg" :disabled="isEdit"
                            required>
                    </div>
                    <div class="form-group mb-4">
                        <label class="font-weight-bold">Tên sách</label>
                        <input v-model="book.TenSach" type="text" class="form-control form-control-lg" required>
                    </div>
                    <div class="form-group mb-4">
                        <label class="font-weight-bold">Tác giả</label>
                        <input v-model="book.TacGia" type="text" class="form-control form-control-lg" required>
                    </div>
                    <div class="form-group mb-4">
                        <label class="font-weight-bold">Năm xuất bản</label>
                        <input v-model="book.NamXuatBan" type="number" class="form-control form-control-lg" required>
                    </div>
                    <div class="text-right">
                        <button type="button" @click="$router.go(-1)" class="btn btn-secondary btn-lg mr-3">Hủy</button>
                        <button type="submit" class="btn btn-success btn-lg px-5">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'

const route = useRoute()
const router = useRouter()
const isEdit = route.params.id !== undefined
const book = ref({
    MaSach: '',
    TenSach: '',
    TacGia: '',
    NamXuatBan: ''
})

const fetchBook = async () => {
    if (isEdit) {
        const res = await api.get(`/books/${route.params.id}`)
        book.value = res.data
    }
}

const saveBook = async () => {
    try {
        if (isEdit) {
            await api.put(`/books/${route.params.id}`, book.value)
        } else {
            await api.post('/books', book.value)
        }
        router.push('/books')
    } catch (err) {
        alert(err.response?.data?.message || 'Lỗi lưu sách')
    }
}

onMounted(fetchBook)
</script>