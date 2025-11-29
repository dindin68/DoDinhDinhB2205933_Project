<template>
    <div class="container mx-0">
        <div class="card shadow-lg border-0" style=" border-radius: 0.5rem;">
            <div class="card-body p-4 p-md-5"
                style="background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899); border-radius: 1.5rem;">
                <!-- Header + Controls -->
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2 class="text-white font-weight-bold">Quản lý mượn sách</h2>
                    <input v-model="q" @input="filterBorrowings" type="text" class="form-control mr-2"
                        placeholder="Tìm mã mượn, độc giả, sách..." />
                    <button @click="checkOverdue" class="btn btn-warning mr-2">Kiểm tra quá hạn</button>
                    <router-link to="/borrowings/create" class="btn btn-primary">Tạo phiếu mượn</router-link>
                </div>

                <!-- Table -->
                <div class="card shadow" style="border-radius: 0.5rem;">
                    <div class="table-responsive">
                        <table class="table table-hover mb-0 align-middle text-center">
                            <thead style="background: linear-gradient(90deg, #6366f1, #8b5cf6); color: white;">
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
                                        <button v-if="b.TrangThai === 'ChoDuyet'"
                                            @click="updateStatus(b._id, 'DaDuyet')"
                                            class="btn btn-success btn-sm mb-1">Duyệt</button>
                                        <button v-if="b.TrangThai === 'DaDuyet'" @click="updateStatus(b._id, 'DaMuon')"
                                            class="btn btn-info btn-sm mb-1">Cho mượn</button>
                                        <button v-if="b.TrangThai === 'DaMuon'" @click="updateStatus(b._id, 'DaTra')"
                                            class="btn btn-secondary btn-sm mb-1">Trả</button>
                                        <button @click="remove(b._id)" class="btn btn-danger btn-sm mb-1">Xóa</button>
                                    </td>
                                </tr>
                                <tr v-if="!filtered.length">
                                    <td colspan="7" class="text-center text-muted py-4">Chưa có phiếu mượn nào</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/api'

const borrowings = ref([])
const q = ref('')

// Lấy danh sách phiếu mượn
const fetchBorrowings = async () => {
    try {
        const res = await api.get('/borrowings')
        borrowings.value = res.data
    } catch (err) {
        console.error(err)
        alert('Lỗi khi lấy dữ liệu')
    }
}

// Kiểm tra quá hạn và cập nhật trực tiếp danh sách
const checkOverdue = async () => {
    try {
        const res = await api.get('/borrowings/check-overdue')
        borrowings.value = res.data   // cập nhật trực tiếp
        alert('Đã kiểm tra và cập nhật trạng thái quá hạn')
    } catch (err) {
        console.error(err)
        alert('Lỗi khi kiểm tra quá hạn')
    }
}

// Cập nhật trạng thái từng phiếu
// Cập nhật trạng thái từng phiếu
const updateStatus = async (_id, status) => {
    try {
        const res = await api.put(`/borrowings/${_id}/trangthai`, { TrangThai: status })
        borrowings.value = borrowings.value.map(b => b._id === _id ? res.data : b)
    } catch (err) {
        console.error(err)
        alert('Lỗi cập nhật trạng thái')
    }
}

// Xóa phiếu mượn
const remove = async (_id) => {
    if (!confirm('Xác nhận xóa phiếu mượn này?')) return
    try {
        await api.delete(`/borrowings/${_id}`)
        borrowings.value = borrowings.value.filter(b => b._id !== _id)
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

// Lọc theo input tìm kiếm
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
