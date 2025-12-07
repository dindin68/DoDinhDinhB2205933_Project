<template>
    <div class="container mt-3">
        <div class="card shadow-lg border-0 rounded-lg">
            <div class="card-header text-white"
                style="background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899); border-radius: 0.5rem;">

                <div class="row align-items-center g-2">

                    <!-- TIÊU ĐỀ -->
                    <div class="col-12 col-md-4">
                        <h3 class="mb-0 text-center text-md-left">
                            <i class="fas fa-user-friends mr-2"></i>
                            Quản lý Độc giả
                        </h3>
                    </div>

                    <!-- SEARCH BAR -->
                    <div class="col-12 col-md-7">
                        <div class="input-group shadow-sm">
                            <input v-model="q" type="text" class="form-control border-0 py-2"
                                style="border-radius: 50rem;" placeholder="Tìm mã độc giả, họ tên, SĐT...">
                        </div>
                    </div>

                    <!-- NÚT + ICON -->
                    <!-- <div class="col-12 col-md-1 text-end">
                        <router-link to="/readers/create"
                            class="btn btn-light btn-sm shadow-sm d-flex align-items-center justify-content-center ms-auto"
                            style="width: 36px; height: 36px; border-radius: 50%;">
                            <i class="fas fa-user-plus text-success"></i>
                        </router-link>
                    </div> -->

                </div>
            </div>

            <!-- BODY -->
            <div class="card-body bg-white p-3 p-md-4">

                <div class="table-responsive">
                    <table class="table table-hover text-center align-middle table-sm table-md">
                        <thead class="bg-light">
                            <tr>
                                <th>Mã độc giả</th>
                                <th>Họ lót</th>
                                <th>Tên</th>
                                <th class="d-none d-md-table-cell">Ngày sinh</th>
                                <th class="d-none d-md-table-cell">Phái</th>
                                <th class="d-none d-md-table-cell">Địa chỉ</th>
                                <th>Điện thoại</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr v-for="reader in filteredReaders" :key="reader._id || reader.MADOCGIA">

                                <td class="text-primary font-weight-bold">
                                    {{ reader.MaDocGia || reader.MADOCGIA }}
                                </td>

                                <td>{{ reader.HOLOT }}</td>
                                <td class="font-weight-bold">{{ reader.TEN }}</td>

                                <td class="d-none d-md-table-cell">
                                    {{ formatDate(reader.NGAYSINH) }}
                                </td>

                                <td class="d-none d-md-table-cell">
                                    {{ reader.PHAI }}
                                </td>

                                <td class="d-none d-md-table-cell text-truncate" style="max-width: 160px;">
                                    {{ reader.DIACHI }}
                                </td>

                                <td>{{ reader.DIENTHOAI }}</td>

                                <td>
                                    <div class="d-flex justify-content-center flex-column flex-sm-row">

                                        <!-- <button @click="$router.push(`/readers/edit/${reader.MaDocGia}`)"
                                            class="btn btn-warning btn-sm mb-1 mb-sm-0 mr-sm-1 btn-action">
                                            <i class="fas fa-edit"></i>
                                        </button> -->

                                        <button @click="deleteReader(reader.MADOCGIA)"
                                            class="btn btn-danger btn-sm btn-action">
                                            <i class="fas fa-trash-alt"></i>
                                        </button>

                                    </div>
                                </td>
                            </tr>

                            <tr v-if="!filteredReaders.length">
                                <td colspan="8" class="text-center text-muted py-3">
                                    Không có độc giả nào.
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

const readers = ref([])
const q = ref('')

const fetchReaders = async () => {
    try {
        const res = await api.get('/readers')
        readers.value = res.data
    } catch (err) {
        console.error(err)
    }
}

const deleteReader = async (id) => {
    if (confirm('Xóa độc giả này vĩnh viễn?')) {
        await api.delete(`/readers/${id}`)
        fetchReaders()
    }
}

const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN')
}

// LỌC TÌM KIẾM REALTIME
const filteredReaders = computed(() => {
    if (!q.value) return readers.value

    const t = q.value.toLowerCase()
    return readers.value.filter(r =>
        (r.MaDocGia || '').toLowerCase().includes(t) ||
        (r.MADOCGIA || '').toLowerCase().includes(t) ||
        (r.HOLOT || '').toLowerCase().includes(t) ||
        (r.TEN || '').toLowerCase().includes(t) ||
        (r.DIENTHOAI || '').toLowerCase().includes(t)
    )
})

onMounted(fetchReaders)
</script>


<style scoped>
.table tbody tr:hover {
    background: #f0f4ff;
    transition: background 0.2s;
}

.btn-action:hover {
    transform: scale(1.05);
    transition: transform 0.2s;
}

.btn-sm {
    font-size: 0.8rem;
}

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
}
</style>
