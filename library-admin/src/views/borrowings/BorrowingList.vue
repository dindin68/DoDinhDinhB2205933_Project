<template>
    <div class="container mt-3">
        <div class="card shadow-lg border-0 rounded-lg">

            <!-- HEADER -->
            <div class="card-header border-0 shadow-lg"
                style="background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899); border-radius: 1rem;">

                <div class="row align-items-center py-2 g-2">

                    <!-- TIÊU ĐỀ -->
                    <div class="col-12 col-lg-3 text-center text-lg-start">
                        <h4
                            class="mb-0 text-white fw-bold d-flex align-items-center justify-content-center justify-content-lg-start gap-2">
                            <i class="fas fa-book-reader"></i>
                            Quản lý mượn sách
                        </h4>
                    </div>

                    <!-- SEARCH + FILTER -->
                    <div class="col-12 col-lg-8">
                        <div class="row g-2">

                            <!-- SEARCH -->
                            <div class="col-12 col-md-8">
                                <div class="input-group shadow-sm">
                                    <input v-model="q" type="text" class="form-control border-0 py-2"
                                        placeholder="Tìm tên sách, tên độc giả...">
                                </div>
                            </div>

                            <!-- FILTER -->
                            <div class="col-12 col-md-4">
                                <div class="input-group shadow-sm">
                                    <select v-model="filterStatus" class="form-control border-0 py-2">
                                        <option value="">Tất cả</option>
                                        <option value="ChoDuyet">Chờ duyệt</option>
                                        <option value="DaDuyet">Đã duyệt</option>
                                        <option value="DaMuon">Đã mượn</option>
                                        <option value="DaTra">Đã trả</option>
                                        <option value="TraMuon">Trả muộn</option>
                                        <option value="DungHan">Đúng hạn</option>
                                    </select>
                                </div>
                            </div>

                        </div>
                    </div>

                    <!-- NÚT + ICON -->
                    <!-- <div class="col-12 col-lg-1 text-center text-lg-end">
                        <router-link to="/borrowings/create"
                            class="btn btn-light btn-sm shadow-sm d-inline-flex align-items-center justify-content-center"
                            style="width: 38px; height: 38px; border-radius: 50%;">
                            <i class="fas fa-plus text-success"></i>
                        </router-link>
                    </div> -->

                </div>
            </div>

            <div class="card-body bg-white p-4">
                <div class="table-responsive">
                    <table class="table table-hover text-center align-middle">
                        <thead class="bg-light">
                            <tr>
                                <th>Mã mượn</th>
                                <th>Độc giả</th>
                                <th>Mã sách</th>
                                <th>Ngày mượn</th>
                                <th>Hạn trả</th>
                                <th>Trạng thái</th>
                                <th>Ghi chú Trả</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="b in filtered" :key="b._id">
                                <td class="text-primary font-weight-bold">{{ b.MaMuon }}</td>

                                <td class="fw-bold text-dark">
                                    {{ getReaderInfo(b.MaDocGia) }}
                                </td>

                                <td>{{ b.MaSach }}</td>
                                <td>{{ formatDate(b.NgayMuon) }}</td>
                                <td>{{ formatDate(b.NgayTra) }}</td>
                                <td>
                                    <span :class="statusClass(b.TrangThai)">{{ formatStatus(b.TrangThai) }}</span>
                                </td>
                                <td>
                                    <span v-if="getReturnStatus(b)" :class="getReturnStatus(b).class">
                                        {{ getReturnStatus(b).label }}
                                    </span>
                                </td>
                                <td>
                                    <button v-if="b.TrangThai === 'ChoDuyet'" @click="updateStatus(b._id, 'DaDuyet')"
                                        class="btn btn-success btn-sm me-1"><i class="fas fa-check"></i></button>
                                    <button v-if="b.TrangThai === 'DaDuyet'" @click="updateStatus(b._id, 'DaMuon')"
                                        class="btn btn-info btn-sm me-1"><i class="fas fa-book-reader"></i></button>
                                    <button v-if="b.TrangThai === 'DaMuon' || b.TrangThai === 'QuaHan'"
                                        @click="updateStatus(b._id, 'DaTra')" class="btn btn-secondary btn-sm me-1"><i
                                            class="fas fa-undo-alt"></i></button>
                                    <button @click="remove(b._id)" class="btn btn-danger btn-sm"><i
                                            class="fas fa-trash-alt"></i></button>
                                </td>
                            </tr>
                            <tr v-if="!filtered.length">
                                <td colspan="8" class="text-center text-muted py-3">Không có dữ liệu.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/api'

const borrowings = ref([])
const readers = ref([])
const q = ref('')
const filterStatus = ref('')

// Fetch Borrowings
const fetchBorrowings = async () => {
    try {
        const res = await api.get('/borrowings')
        borrowings.value = res.data
    } catch (err) { console.error(err) }
}

// Fetch Readers
const fetchReaders = async () => {
    try {
        const res = await api.get('/readers')
        readers.value = res.data
    } catch (err) { console.error(err) }
}

// HÀM GHÉP TÊN (Đã sửa theo yêu cầu)
const getReaderInfo = (maDocGiaTrongPhieu) => {
    if (!maDocGiaTrongPhieu) return '---'
    if (readers.value.length === 0) return maDocGiaTrongPhieu

    // Tìm trong danh sách readers người có MADOCGIA trùng khớp
    // Lưu ý: Đảm bảo API trả về đúng tên trường là MADOCGIA, HOLOT, TEN
    const reader = readers.value.find(r => r.MADOCGIA === maDocGiaTrongPhieu)

    if (reader) {
        // Ghép chuỗi HOLOT và TEN
        return `${reader.HOLOT} ${reader.TEN}`
    }
    return maDocGiaTrongPhieu
}

// Computed Filter (Cập nhật tìm kiếm theo tên)
const filtered = computed(() => {
    let data = borrowings.value

    if (q.value) {
        const t = q.value.toLowerCase()
        data = data.filter(b => {
            // Lấy tên ra để tìm kiếm
            const readerName = getReaderInfo(b.MaDocGia).toLowerCase()

            return (b.MaMuon || '').toLowerCase().includes(t) ||
                readerName.includes(t) ||
                (b.MaSach || '').toLowerCase().includes(t)
        })
    }

    if (!filterStatus.value) return data
    return data.filter(b => {
        const note = getReturnStatus(b)?.label
        switch (filterStatus.value) {
            case 'TraMuon': return note === 'Trả muộn'
            case 'DungHan': return note === 'Đúng hạn'
            default: return b.TrangThai === filterStatus.value
        }
    })
})

const updateStatus = async (id, status) => {
    const doUpdate = async (force = false) => {
        const payload = { TrangThai: status, force }
        const res = await api.put(`/borrowings/${id}/trangthai`, payload)
        borrowings.value = borrowings.value.map(b => b._id === id ? res.data : b)
    }
    try { await doUpdate(false) }
    catch (err) {
        if (err.response?.status === 403) {
            if (confirm(err.response.data.message + "\nBạn có muốn duyệt tiếp không?")) await doUpdate(true)
        } else { alert(err.response?.data?.message || 'Lỗi cập nhật.') }
    }
}

const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : ''
const formatStatus = (s) => (s === 'QuaHan' ? 'Đang mượn' : s)
const statusClass = (s) => {
    switch (s) {
        case 'ChoDuyet': return 'badge bg-warning text-white'
        case 'DaDuyet': return 'badge bg-info text-white'
        case 'DaTra': return 'badge bg-success text-white'
        case 'DaMuon': return 'badge bg-primary text-white'
        default: return 'badge bg-secondary text-white'
    }
}

const getReturnStatus = (b) => {
    const dueDate = new Date(b.NgayTra)
    dueDate.setHours(0, 0, 0, 0)

    // 1) Đã trả → kiểm tra đúng hạn / trả muộn
    if (b.TrangThai === "DaTra" && b.NgayTraThucTe) {
        const returnDate = new Date(b.NgayTraThucTe)
        returnDate.setHours(0, 0, 0, 0)

        if (returnDate > dueDate) {
            return { label: "Trả muộn", class: "badge bg-danger text-white" }
        }
        return { label: "Đúng hạn", class: "badge bg-success text-white" }
    }

    // 2) Chưa mượn → ChoDuyet / DaDuyet
    if (["ChoDuyet", "DaDuyet"].includes(b.TrangThai)) {
        return { label: "Chưa mượn", class: "badge bg-secondary text-white" }
    }

    // 3) Đang mượn
    if (b.TrangThai === "DaMuon") {
        return { label: "Đang mượn", class: "badge bg-primary text-white" }
    }

    return null
}


const remove = async (id) => {
    if (confirm('Xóa phiếu này?')) {
        await api.delete(`/borrowings/${id}`)
        fetchBorrowings()
    }
}

onMounted(() => {
    fetchBorrowings()
    fetchReaders()
})
</script>

<style scoped>
.btn-sm {
    font-size: 0.85rem;
}

.badge {
    font-size: 0.85rem;
    padding: 0.45em 0.6em;
}

.btn {
    border-radius: 0.5rem;
}

.form-control {
    border-radius: 50rem;
}

.hover-scale {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-scale:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}
</style>