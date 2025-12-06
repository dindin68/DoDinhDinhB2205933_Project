<template>
    <div class="container mt-3">
        <div class="card shadow-lg border-0 rounded-lg">

            <!-- ✅ HEADER MỚI -->
            <div class="card-header text-white"
                style="background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899); border-radius: 0.5rem;">

                <div class="row align-items-center g-2">

                    <!-- TIÊU ĐỀ -->
                    <div class="col-12 col-md-3">
                        <h3 class="mb-0 text-center text-md-left">
                            <i class="fas fa-book mr-2"></i>
                            Quản lý Sách
                        </h3>
                    </div>

                    <!-- ✅ SEARCH BAR CHUẨN -->
                    <div class="col-12 col-md-8">
                        <div class="input-group shadow-sm">
                            <input v-model="q" type="text" class="form-control border-0 py-2"
                                style="border-radius: 50rem;" placeholder="Tìm mã sách, tên sách, tác giả...">
                        </div>
                    </div>

                    <!-- ✅ NÚT + ICON -->
                    <div class="col-12 col-md-1 text-end">
                        <router-link to="/books/create"
                            class="btn btn-light btn-sm shadow-sm d-flex align-items-center justify-content-center ms-auto"
                            style="width: 36px; height: 36px; border-radius: 50%;">
                            <i class="fas fa-plus text-success"></i>
                        </router-link>
                    </div>

                </div>
            </div>

            <!-- BODY -->
            <div class="card-body bg-white p-3 p-md-4">

                <div class="table-responsive">
                    <table class="table table-hover text-center align-middle table-sm table-md">
                        <thead class="bg-light">
                            <tr>
                                <th>Mã sách</th>
                                <th>Ảnh</th>
                                <th>Tên sách</th>
                                <th class="d-none d-md-table-cell">Tác giả</th>
                                <th class="d-none d-md-table-cell">NXB</th>
                                <th>Năm XB</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr v-for="b in filteredBooks" :key="b._id || b.MaSach">

                                <td class="text-primary font-weight-bold">
                                    {{ b.MaSach }}
                                </td>

                                <td>
                                    <img v-if="b.ImageUrl" :src="apiBase + b.ImageUrl" alt="Ảnh sách" class="book-img">
                                </td>

                                <td class="font-weight-bold text-truncate" style="max-width: 160px;">
                                    {{ b.TenSach }}
                                </td>

                                <td class="d-none d-md-table-cell">{{ b.TacGia }}</td>
                                <td class="d-none d-md-table-cell">{{ b.TENNXB }}</td>

                                <td>{{ b.NamXuatBan }}</td>

                                <td>
                                    <div class="d-flex justify-content-center flex-column flex-sm-row">

                                        <button @click="$router.push(`/books/edit/${b.MaSach}`)"
                                            class="btn btn-warning btn-sm mb-1 mb-sm-0 mr-sm-1 btn-action">
                                            <i class="fas fa-edit"></i>
                                        </button>

                                        <button @click="deleteBook(b.MaSach)" class="btn btn-danger btn-sm btn-action">
                                            <i class="fas fa-trash-alt"></i>
                                        </button>

                                    </div>
                                </td>
                            </tr>

                            <tr v-if="!filteredBooks.length">
                                <td colspan="7" class="text-center text-muted py-3">
                                    Không có sách nào.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    </div>
</template>


<script setup>
import { onMounted, ref, computed } from 'vue'
import api from '@/api'

const books = ref([])
const q = ref('')
const apiBase = "http://localhost:3000"

// Fetch
const fetchBooks = async () => {
    try {
        const res = await api.get('/books')
        books.value = res.data
    } catch (err) {
        console.error(err)
    }
}

const deleteBook = async (id) => {
    if (confirm('Xóa sách này vĩnh viễn?')) {
        await api.delete(`/books/${id}`)
        fetchBooks()
    }
}

// ✅ LỌC TÌM KIẾM
const filteredBooks = computed(() => {
    if (!q.value) return books.value

    const t = q.value.toLowerCase()
    return books.value.filter(b =>
        (b.MaSach || '').toLowerCase().includes(t) ||
        (b.TenSach || '').toLowerCase().includes(t) ||
        (b.TacGia || '').toLowerCase().includes(t)
    )
})

onMounted(fetchBooks)
</script>


<style scoped>
/* Ảnh sách */
.book-img {
    width: 40px;
    height: 60px;
    object-fit: cover;
    border-radius: 6px;
}

/* Hover bảng */
.table tbody tr:hover {
    background: #f0f4ff;
    transition: background 0.2s;
}

/* Nút action */
.btn-action:hover {
    transform: scale(1.05);
    transition: transform 0.2s;
}

.btn-sm {
    font-size: 0.8rem;
}

/* Responsive Mobile */
@media (max-width: 768px) {
    .btn-action {
        font-size: 0.7rem;
        padding: 0.35rem 0.5rem;
    }

    .table td,
    .table th {
        padding: 0.5rem;
        font-size: 0.75rem;
    }

    .book-img {
        width: 32px;
        height: 48px;
    }
}
</style>
