<template>
    <div class="container mx-0">
        <div class="card shadow-lg border-0" style=" border-radius: 0.5rem;">
            <!-- Card Header -->
            <div class="card-body p-4 p-md-5"
                style="background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);  border-radius: 0.5rem;">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2 class="text-white font-weight-bold">Quản Lý Sách</h2>
                    <button @click="$router.push('/books/create')" class="btn btn-light btn-lg font-weight-bold">
                        + Thêm sách mới
                    </button>
                </div>

                <!-- Table Card -->
                <div class="card shadow" style="border-radius: 0.5rem;">
                    <div class="table-responsive">
                        <table class="table table-hover mb-0 align-middle text-center">
                            <thead
                                style="background: linear-gradient(90deg, #6366f1, #8b5cf6); color: white; border-radius: 1rem;">
                                <tr>
                                    <th>Mã sách</th>
                                    <th>Ảnh</th>
                                    <th>Tên sách</th>
                                    <th>Tác giả</th>
                                    <th class="text-center">Năm XB</th>
                                    <th class="text-center">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="b in books" :key="b._id || b.MaSach" class="table-row-hover">
                                    <td class="font-monospace font-weight-bold text-primary">{{ b.MaSach }}</td>
                                    <td>
                                        <img v-if="b.ImageUrl" :src="apiBase + b.ImageUrl" alt="Ảnh sách"
                                            style="width: 60px; height: 80px; object-fit: cover; border-radius: 6px;">
                                    </td>
                                    <td class="font-weight-semibold">{{ b.TenSach }}</td>
                                    <td>{{ b.TacGia }}</td>
                                    <td class="text-center">{{ b.NamXuatBan }}</td>
                                    <td class="text-center">
                                        <button @click="$router.push(`/books/edit/${b.MaSach}`)"
                                            class="btn btn-outline-primary btn-sm mr-2 btn-action">
                                            ✏️ Sửa
                                        </button>
                                        <button @click="deleteBook(b.MaSach)"
                                            class="btn btn-outline-danger btn-sm btn-action">
                                            🗑️ Xóa
                                        </button>
                                    </td>
                                </tr>
                                <tr v-if="!books.length">
                                    <td colspan="5" class="text-center text-muted py-4">
                                        Chưa có sách nào. Hãy thêm sách đầu tiên!
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.table-row-hover:hover {
    background: #f0f4ff;
    /* màu hover nhẹ cho row */
    transition: background 0.2s;
}

.btn-action:hover {
    transform: scale(1.05);
    transition: transform 0.2s;
}
</style>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'

const books = ref([])
const router = useRouter()
const apiBase = "http://localhost:3000";  //  BASE URL backend

const fetchBooks = async () => {
    const res = await api.get('/books')
    books.value = res.data
}

const deleteBook = async (id) => {
    if (confirm('Xóa sách này vĩnh viễn?')) {
        await api.delete(`/books/${id}`)
        fetchBooks()
    }
}

onMounted(fetchBooks)
</script>
