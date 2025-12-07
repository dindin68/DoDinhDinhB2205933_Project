<template>
    <div class="container mt-3">
        <div class="card shadow-lg border-0 rounded-lg">
            <div class="card-header border-0 shadow-lg"
                style="background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899); border-radius: 1rem;">
                <div class="row align-items-center py-2 g-2">
                    <div class="col-12 col-lg-3 text-center text-lg-start">
                        <h4
                            class="mb-0 text-white fw-bold d-flex align-items-center justify-content-center justify-content-lg-start gap-2">
                            <i class="fas fa-book-reader"></i> Quản lý mượn sách
                        </h4>
                    </div>
                    <div class="col-12 col-lg-8">
                        <div class="row g-2">
                            <div class="col-12 col-md-8">
                                <div class="input-group shadow-sm">
                                    <input v-model="q" type="text" class="form-control border-0 py-2"
                                        placeholder="Tìm mã sách, tên độc giả...">
                                </div>
                            </div>
                            <div class="col-12 col-md-4">
                                <div class="input-group shadow-sm">
                                    <select v-model="filterStatus" class="form-control border-0 py-2">
                                        <option value="">Tất cả</option>
                                        <option value="ChoDuyet">Chờ duyệt</option>
                                        <option value="DaDuyet">Đã duyệt</option>
                                        <option value="DaMuon">Đang mượn</option>
                                        <option value="DaTra">Đã trả</option>
                                        <option value="KhongDuyet">Đã từ chối</option>
                                        <option value="TraMuon">Trả muộn</option>
                                        <option value="DungHan">Đúng hạn</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
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
                                <td class="fw-bold text-dark">{{ getReaderInfo(b.MaDocGia) }}</td>
                                <td>{{ b.MaSach }}</td>
                                <td>{{ formatDate(b.NgayMuon) }}</td>
                                <td>{{ formatDate(b.NgayTra) }}</td>
                                <td><span :class="statusClass(b.TrangThai)">{{ formatStatus(b.TrangThai) }}</span></td>
                                <td><span v-if="getReturnStatus(b)" :class="getReturnStatus(b).class">{{
                                    getReturnStatus(b).label }}</span></td>
                                <td>
                                    <button v-if="b.TrangThai === 'ChoDuyet'" @click="handleApprove(b)"
                                        class="btn btn-success btn-sm me-1" title="Duyệt">
                                        <i class="fas fa-check"></i>
                                    </button>

                                    <button v-if="b.TrangThai === 'DaDuyet'" @click="updateStatus(b._id, 'DaMuon')"
                                        class="btn btn-info btn-sm me-1"><i class="fas fa-book-reader"></i></button>
                                    <button v-if="b.TrangThai === 'DaMuon' || b.TrangThai === 'QuaHan'"
                                        @click="updateStatus(b._id, 'DaTra')" class="btn btn-secondary btn-sm me-1"><i
                                            class="fas fa-undo-alt"></i></button>

                                    <button @click="remove(b._id)" class="btn btn-outline-danger btn-sm border-0"><i
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

    <div v-if="showModal" class="custom-modal-backdrop">
        <div class="custom-modal-content card shadow-lg border-0">
            <div class="card-header bg-warning text-dark fw-bold">
                <i class="fas fa-exclamation-triangle me-2"></i> CẢNH BÁO VI PHẠM
            </div>
            <div class="card-body">
                <p class="mb-3 text-secondary">Độc giả này có các vấn đề sau:</p>
                <ul class="text-danger fw-bold text-start bg-light p-3 rounded">
                    <li v-for="(msg, index) in warningMessages" :key="index">{{ msg }}</li>
                </ul>
                <p class="mb-0 mt-3 text-center fw-bold">Bạn muốn xử lý thế nào?</p>
            </div>
            <div class="card-footer d-flex justify-content-between bg-white border-0 pb-3 px-4">
                <button @click="confirmRejectInModal" class="btn btn-danger rounded-pill px-4">
                    <i class="fas fa-times me-1"></i> Từ chối
                </button>

                <button @click="confirmForceApprove" class="btn btn-success rounded-pill px-4">
                    <i class="fas fa-check me-1"></i> Vẫn duyệt
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/api'

const borrowings = ref([])
const readers = ref([])
const booksMap = ref({});
const q = ref('')
const filterStatus = ref('')

const showModal = ref(false)
const warningMessages = ref([])
const pendingBorrowingId = ref(null)

// Fetch Data
const fetchBorrowings = async () => {
    try {
        const res = await api.get('/borrowings')
        borrowings.value = res.data
    } catch (err) { console.error(err) }
}
const fetchReaders = async () => {
    try {
        const res = await api.get('/readers')
        readers.value = res.data
    } catch (err) { console.error(err) }
}
const getReaderInfo = (maDocGiaTrongPhieu) => {
    if (!maDocGiaTrongPhieu) return '---'
    if (readers.value.length === 0) return maDocGiaTrongPhieu
    const reader = readers.value.find(r => r.MADOCGIA === maDocGiaTrongPhieu)
    if (reader) return `${reader.HOLOT} ${reader.TEN}`
    return maDocGiaTrongPhieu
}
const fetchData = async () => {
    try {
        const [resBorrow, resBooks, resStats] = await Promise.all([
            api.get('/borrowings'),           // Lấy danh sách phiếu mượn
            api.get('/books'),                // Lấy thông tin sách gốc
            api.get('/borrowings/stats')      // Lấy số lượng đang bận
        ]);

        borrowings.value = resBorrow.data;

        // Xử lý dữ liệu sách để tính tồn kho
        const stats = resStats.data;

        // Tạo một từ điển (Map) sách: { "HEL00": { TenSach:..., ConLai: 5 } }
        resBooks.data.forEach(book => {
            const stat = stats.find(s => s._id === book.MaSach);
            const daMuon = stat ? stat.count : 0;

            booksMap.value[book.MaSach] = {
                ...book,
                ConLai: (book.SOQUYEN || 0) - daMuon // Tính sẵn số còn lại
            };
        });

    } catch (err) {
        console.error(err);
    }
};

// LOGIC XỬ LÝ DUYỆT / TỪ CHỐI

// Logic nút "Duyệt" (Check xanh)
// Logic nút "Duyệt" (Check xanh)
const handleApprove = (borrowing) => {
    let warnings = [];

    // --- 1. KIỂM TRA TỒN KHO (MỚI THÊM) ---
    const bookInfo = booksMap.value[borrowing.MaSach];
    if (bookInfo && bookInfo.ConLai <= 0) {
        warnings.push(`Sách "${bookInfo.TenSach}" ĐÃ HẾT HÀNG (Kho: ${bookInfo.ConLai}).`);
        warnings.push(`Vui lòng TỪ CHỐI yêu cầu này.`);
    }

    // --- 2. KIỂM TRA LỊCH SỬ ĐỘC GIẢ (CŨ) ---
    const readerId = borrowing.MaDocGia;
    const history = borrowings.value.filter(item => item.MaDocGia === readerId);

    // Đếm số sách đang giữ và số lần trả muộn
    const unreturnedCount = history.filter(item => ['DaMuon', 'QuaHan'].includes(item.TrangThai) && item._id !== borrowing._id).length;

    const lateCount = history.filter(item => {
        if (item.TrangThai === 'DaTra' && item.NgayTraThucTe) {
            return new Date(item.NgayTraThucTe).setHours(0, 0, 0, 0) > new Date(item.NgayTra).setHours(0, 0, 0, 0);
        }
        return false;
    }).length;

    if (unreturnedCount >= 5) warnings.push(`Đang mượn ${unreturnedCount} cuốn (Quá giới hạn 5).`);
    if (lateCount >= 5) warnings.push(`Đã trả trễ ${lateCount} lần (Uy tín thấp).`);

    // --- 3. XỬ LÝ KẾT QUẢ ---
    if (warnings.length > 0) {
        // Nếu có bất kỳ cảnh báo nào (hết hàng HOẶC độc giả xấu), hiện Modal
        warningMessages.value = warnings;
        pendingBorrowingId.value = borrowing._id;
        showModal.value = true;
    } else {
        // Nếu mọi thứ ổn, duyệt luôn
        updateStatus(borrowing._id, 'DaDuyet');
    }
}

//Logic trong Modal: Nút "Từ chối"
const confirmRejectInModal = async () => {
    if (pendingBorrowingId.value) {
        await updateStatus(pendingBorrowingId.value, 'KhongDuyet'); // Cập nhật trạng thái thành Không Duyệt
    }
    closeModal();
}

//Logic trong Modal: Nút "Vẫn duyệt"
const confirmForceApprove = async () => {
    if (pendingBorrowingId.value) {
        await updateStatus(pendingBorrowingId.value, 'DaDuyet');
    }
    closeModal();
}

const closeModal = () => {
    showModal.value = false;
    pendingBorrowingId.value = null;
    warningMessages.value = [];
}

const updateStatus = async (id, status) => {
    try {
        const payload = { TrangThai: status }
        // Gọi API cập nhật
        const res = await api.put(`/borrowings/${id}/trangthai`, payload)
        // Cập nhật lại UI ngay lập tức
        borrowings.value = borrowings.value.map(b => b._id === id ? res.data : b)
        await fetchData()
    } catch (err) {
        alert(err.response?.data?.message || 'Lỗi cập nhật.')
    }
}

//  UTILS & FORMAT
const filtered = computed(() => {
    let data = borrowings.value
    if (q.value) {
        const t = q.value.toLowerCase()
        data = data.filter(b => {
            const readerName = getReaderInfo(b.MaDocGia).toLowerCase()
            return (b.MaMuon || '').toLowerCase().includes(t) || readerName.includes(t) || (b.MaSach || '').toLowerCase().includes(t)
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

const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : ''

//  Hiển thị trạng thái
const formatStatus = (s) => {
    if (s === 'QuaHan') return 'Đang mượn (Quá hạn)';
    if (s === 'KhongDuyet') return 'Đã từ chối'; // Thêm dòng này
    return s;
}

// Màu sắc trạng thái
const statusClass = (s) => {
    switch (s) {
        case 'ChoDuyet': return 'badge bg-warning text-dark'
        case 'DaDuyet': return 'badge bg-info text-dark'
        case 'DaTra': return 'badge bg-success'
        case 'DaMuon': return 'badge bg-primary'
        case 'KhongDuyet': return 'badge bg-danger'
        default: return 'badge bg-secondary'
    }
}

const getReturnStatus = (b) => {
    const dueDate = new Date(b.NgayTra)
    dueDate.setHours(0, 0, 0, 0)
    if (b.TrangThai === "DaTra" && b.NgayTraThucTe) {
        const returnDate = new Date(b.NgayTraThucTe)
        returnDate.setHours(0, 0, 0, 0)
        return returnDate > dueDate ? { label: "Trả muộn", class: "badge bg-danger" } : { label: "Đúng hạn", class: "badge bg-success" }
    }
    if (["ChoDuyet", "DaDuyet", "KhongDuyet"].includes(b.TrangThai)) return { label: "Chưa mượn", class: "badge bg-secondary" }
    if (b.TrangThai === "DaMuon") return { label: "Đang mượn", class: "badge bg-primary" }
    return null
}

const remove = async (id) => {
    if (confirm('Xóa vĩnh viễn phiếu này?')) {
        await api.delete(`/borrowings/${id}`)
        fetchBorrowings()
    }
}

onMounted(() => {
    fetchBorrowings()
    fetchReaders()
    fetchData()
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

.custom-modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.custom-modal-content {
    background: white;
    width: 90%;
    max-width: 500px;
    border-radius: 1rem;
    overflow: hidden;
}
</style>