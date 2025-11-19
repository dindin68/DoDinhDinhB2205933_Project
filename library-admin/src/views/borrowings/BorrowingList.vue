<template>
    <div class="card-body p-4 p-md-5"
        style="background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899); border-radius: 1.5rem;">
        <!-- Header + Controls -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="h3 font-weight-bold">Quản lý mượn sách</h2>
            <div class="form-inline">
                <input v-model="q" @input="fetchBorrowings" type="text" class="form-control mr-2"
                    placeholder="Tìm mã mượn, độc giả, sách..." />
                <button @click="checkOverdue" class="btn btn-warning mr-2">Kiểm tra quá hạn</button>
                <router-link to="/borrowings/create" class="btn btn-primary">Tạo phiếu mượn</router-link>
            </div>
        </div>

        <!-- Table -->
        <div class="table-responsive">
            <table class="table table-striped table-hover table-bordered">
                <thead class="thead-dark">
                    <tr>
                        <th>Mã mượn</th>
                        <th>Độc giả</th>
                        <th>Mã sách</th>
                        <th>Ng. mượn</th>
                        <th>Ng. trả</th>
                        <th>Trạng thái</th>
                        <th class="text-center">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="b in filtered" :key="b._id">
                        <td class="font-monospace text-primary">{{ b.MaMuon }}</td>
                        <td>{{ b.MaDocGia }}</td>
                        <td>{{ b.MaSach }}</td>
                        <td>{{ formatDate(b.NgayMuon) }}</td>
                        <td>{{ formatDate(b.NgayTra) }}</td>
                        <td>
                            <span :class="statusClass(b.TrangThai)">{{ b.TrangThai }}</span>
                        </td>
                        <td class="text-center">
                            <button v-if="b.TrangThai === 'ChoDuyet'" @click="updateStatus(b.MaMuon, 'DaDuyet')"
                                class="btn btn-success btn-sm mb-1">Duyệt</button>
                            <button v-if="b.TrangThai === 'DaDuyet'" @click="updateStatus(b.MaMuon, 'DaMuon')"
                                class="btn btn-info btn-sm mb-1">Cho mượn</button>
                            <button v-if="b.TrangThai === 'DaMuon'" @click="updateStatus(b.MaMuon, 'DaTra')"
                                class="btn btn-secondary btn-sm mb-1">Trả</button>
                            <button @click="remove(b.MaMuon)" class="btn btn-danger btn-sm mb-1">Xóa</button>
                        </td>
                    </tr>
                    <tr v-if="!filtered.length">
                        <td colspan="7" class="text-center text-muted py-4">Chưa có phiếu mượn nào</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/api'

const borrowings = ref([])
const q = ref('')

const fetchBorrowings = async () => {
    try {
        const res = await api.get('/borrowings')
        borrowings.value = res.data
    } catch (err) {
        console.error(err)
        alert('Lỗi khi lấy dữ liệu')
    }
}

const checkOverdue = async () => {
    try {
        await api.get('/borrowings/check-overdue')
        await fetchBorrowings()
        alert('Đã kiểm tra và cập nhật trạng thái quá hạn')
    } catch (err) {
        console.error(err)
        alert('Lỗi khi kiểm tra quá hạn')
    }
}

const updateStatus = async (id, status) => {
    try {
        await api.put(`/borrowings/${id}/trangthai`, { TrangThai: status })
        await fetchBorrowings()
    } catch (err) {
        console.error(err)
        alert('Lỗi cập nhật trạng thái')
    }
}

const remove = async (id) => {
    if (!confirm('Xác nhận xóa phiếu mượn này?')) return
    try {
        await api.delete(`/borrowings/${id}`)
        await fetchBorrowings()
    } catch (err) {
        console.error(err)
        alert('Lỗi xóa')
    }
}

const formatDate = (d) => d ? new Date(d).toLocaleDateString() : ''

const statusClass = (s) => {
    switch (s) {
        case 'ChoDuyet': return 'badge badge-warning'
        case 'DaDuyet': return 'badge badge-info'
        case 'DaMuon': return 'badge badge-primary'
        case 'DaTra': return 'badge badge-success'
        case 'QuaHan': return 'badge badge-danger'
        default: return 'badge badge-secondary'
    }
}

const filtered = computed(() => {
    if (!q.value) return borrowings.value
    const t = q.value.toLowerCase()
    return borrowings.value.filter(b =>
        (b.MaMuon || '').toLowerCase().includes(t) ||
        (b.MaDocGia || '').toLowerCase().includes(t) ||
        (b.MaSach || '').toLowerCase().includes(t)
    )
})

onMounted(fetchBorrowings)
</script>
