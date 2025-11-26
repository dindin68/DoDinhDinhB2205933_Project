<template>
    <div class="container mt-5">
        <div class="card shadow-lg border-0 rounded-lg">

            <!-- HEADER -->
            <div class="card-header text-white d-flex align-items-center justify-content-between"
                style="background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);  border-radius: 0.5rem;">
                <h3 class=" mb-0">{{ isEdit ? 'Sửa Sách' : 'Thêm Sách Mới' }}</h3>
                <i class="fas fa-book fa-lg"></i>
            </div>

            <!-- BODY -->
            <div class="card-body bg-white p-5 rounded-bottom">
                <form @submit.prevent="saveBook">

                    <div class="form-group mb-4">
                        <label class="font-weight-bold">Mã sách</label>
                        <div class="input-group">
                            <div class="input-group-prepend">
                                <span class="input-group-text"><i class="fas fa-hashtag"></i></span>
                            </div>
                            <input v-model="book.MaSach" type="text" class="form-control form-control-lg"
                                :disabled="isEdit" required>
                        </div>
                    </div>

                    <div class="form-group mb-4">
                        <label class="font-weight-bold">Tên sách</label>
                        <div class="input-group">
                            <div class="input-group-prepend">
                                <span class="input-group-text"><i class="fas fa-book"></i></span>
                            </div>
                            <input v-model="book.TenSach" type="text" class="form-control form-control-lg" required>
                        </div>
                    </div>

                    <div class="form-group mb-4">
                        <label class="font-weight-bold">Tác giả</label>
                        <div class="input-group">
                            <div class="input-group-prepend">
                                <span class="input-group-text"><i class="fas fa-user"></i></span>
                            </div>
                            <input v-model="book.TacGia" type="text" class="form-control form-control-lg" required>
                        </div>
                    </div>

                    <div class="form-group mb-4">
                        <label class="font-weight-bold">Năm xuất bản</label>
                        <div class="input-group">
                            <div class="input-group-prepend">
                                <span class="input-group-text"><i class="fas fa-calendar-alt"></i></span>
                            </div>
                            <input v-model="book.NamXuatBan" type="number" class="form-control form-control-lg"
                                required>
                        </div>
                    </div>

                    <div class="form-group mb-4">
                        <label class="font-weight-bold">Ảnh sách</label>
                        <input type="file" @change="handleFileUpload" class="form-control">
                    </div>

                    <div class="d-flex justify-content-end mt-4">
                        <button type="button" @click="$router.go(-1)" class="btn btn-secondary btn-lg mr-3">
                            <i class="fas fa-times mr-1"></i> Hủy
                        </button>
                        <button type="submit" class="btn btn-primary btn-lg px-5">
                            <i class="fas fa-save mr-1"></i> Lưu
                        </button>
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

const imageFile = ref(null)
const handleFileUpload = (e) => { imageFile.value = e.target.files[0] }

const fetchBook = async () => {
    if (isEdit) {
        const res = await api.get(`/books/${route.params.id}`)
        book.value = res.data
    }
}

const saveBook = async () => {
    try {
        const formData = new FormData()
        formData.append('MaSach', book.value.MaSach)
        formData.append('TenSach', book.value.TenSach)
        formData.append('TacGia', book.value.TacGia)
        formData.append('NamXuatBan', book.value.NamXuatBan)
        if (imageFile.value) formData.append('image', imageFile.value)

        if (isEdit) {
            await api.put(`/books/${route.params.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
        } else {
            await api.post('/books', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
        }

        router.push('/books')
    } catch (err) {
        alert(err.response?.data?.message || 'Lỗi lưu sách')
    }
}

onMounted(fetchBook)
</script>

<style scoped>
.card-header h3 {
    font-weight: 700;
}

.input-group-text {
    background-color: #f1f1f1;
}

.btn:hover {
    opacity: 0.9;
}

.card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.card-body {
    background-color: #fff;
}
</style>
