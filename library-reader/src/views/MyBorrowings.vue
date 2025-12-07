<template>
    <div class="page">

        <!-- Header -->
        <div class="gradient-header p-4 text-white mb-4">
            <h2 class="mb-3">Yêu cầu mượn của tôi</h2>

            <!-- FILTER BUTTONS -->
            <div class="btn-group" role="group">
                <button v-for="s in statusList" :key="s.value" class="btn btn-sm"
                    :class="filterStatus === s.value ? 'btn-light text-dark' : 'btn-outline-light'"
                    @click="filterStatus = s.value">
                    {{ s.label }}
                </button>
            </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center text-secondary mt-4">Đang tải...</div>

        <!-- Card list -->
        <div v-else>
            <div v-for="b in filteredItems" :key="b._id" class="card shadow-sm mb-3">
                <div class="card-body">
                    <h5 class="card-title text-primary">
                        {{ b.MaMuon || b._id }}
                    </h5>

                    <p class="card-text mb-1">
                        <strong>Mã sách:</strong> {{ b.MaSach }}
                    </p>

                    <p class="card-text">
                        <strong>Trạng thái:</strong>
                        <span :class="statusClass(b.TrangThai)" class="ms-1">
                            {{ formatStatus(b.TrangThai) }}
                        </span>
                    </p>

                    <p class="card-text mb-0" v-if="getReturnStatus(b)">
                        <strong>Trạng thái trả:</strong>
                        <span :class="getReturnStatus(b).class" class="ms-1">
                            {{ getReturnStatus(b).label }}
                        </span>
                    </p>

                    <div v-if="b.TrangThai === 'KhongDuyet'" class="alert alert-danger mt-3 p-2 mb-0"
                        style="font-size: 0.9rem;">
                        <i class="fas fa-exclamation-circle me-1"></i>
                        <strong>Lý do từ chối, 1 trong những lý do sau:</strong>
                        {{ b.GhiChu || 'Vi phạm quy định (Bạn đã mượn hoặc trả quá hạn >= 5 lần)' }}
                        {{ b.GhiChu || ' hoặc kho đã được mượn hết sách. Vui lòng mượn lại lần sau' }}

                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api'
import { useRouter } from 'vue-router'

const items = ref([])
const loading = ref(false)
const filterStatus = ref("all")

const statusList = [
    { label: "Tất cả", value: "all" },
    { label: "Chờ duyệt", value: "ChoDuyet" },
    { label: "Không duyệt", value: "KhongDuyet" },
    { label: "Đã duyệt", value: "DaDuyet" },
    { label: "Đã mượn", value: "DaMuon" },
    { label: "Đã trả", value: "DaTra" },
    { label: "Trả muộn", value: "TraMuon" },
    { label: "Đúng hạn", value: "DungHan" },
]


// Lọc danh sách theo trạng thái
const filteredItems = computed(() => {
    if (filterStatus.value === "all") return items.value

    return items.value.filter(b => {
        const returnStatus = getReturnStatus(b)?.label

        switch (filterStatus.value) {
            case "TraMuon":
                return returnStatus === "Trả muộn"

            case "DungHan":
                return returnStatus === "Đúng hạn"

            default:
                return b.TrangThai === filterStatus.value
        }
    })
})


const token = localStorage.getItem('reader_token') || ''

const router = useRouter()

const load = async () => {
    loading.value = true
    const token = localStorage.getItem('reader_token')

    if (!token) {
        // Sử dụng Vue Router để chuyển hướng an toàn
        router.push('/login')
        loading.value = false // Dừng loading ngay
        return
    }

    try {
        const res = await api.get('/borrowings/me')
        items.value = res.data || []
    } catch (e) {
        if (e.response && e.response.status === 401) {
            // Nếu server vẫn trả 401 (token hết hạn/không hợp lệ), chuyển hướng về login
            localStorage.removeItem('reader_token')
            router.push('/login')
        }
        console.error(e)
        alert('Lỗi khi tải phiếu mượn')
    } finally {
        loading.value = false
    }
}

onMounted(load)

const formatStatus = (s) => {
    switch (s) {
        case 'ChoDuyet': return 'Chờ duyệt';
        case 'DaDuyet': return 'Đã duyệt';
        case 'KhongDuyet': return 'Không duyệt';
        case 'DaMuon': return 'Đang mượn';
        case 'DaTra': return 'Đã trả';
        case 'QuaHan': return 'Quá hạn';
        default: return s;
    }
}
const getReturnStatus = (b) => {
    if (['ChoDuyet', 'DaDuyet', 'KhongDuyet'].includes(b.TrangThai)) {
        return { label: 'Chưa nhận sách', class: 'badge bg-light text-secondary border' }
    }

    if (!b.NgayTraThucTe) {
        return { label: 'Chưa trả', class: 'badge bg-warning text-dark' }
    }

    const dueDate = new Date(b.NgayTra)
    dueDate.setHours(0, 0, 0, 0)

    const returnDate = new Date(b.NgayTraThucTe)
    returnDate.setHours(0, 0, 0, 0)

    if (returnDate > dueDate) {
        return { label: 'Trả muộn', class: 'badge bg-danger' }
    }

    return { label: 'Đúng hạn', class: 'badge bg-success' }
}

const statusClass = (st) => {
    return {
        "badge bg-secondary": st === "ChoDuyet",
        "badge bg-danger": st === "KhongDuyet",
        "badge bg-info text-dark": st === "DaDuyet",
        "badge bg-primary": st === "DaMuon",
        "badge bg-success": st === "DaTra",
        "badge bg-warning text-dark": st === "QuaHan",
    }
}

</script>

<style scoped>
.page {
    max-width: 800px;
    margin: 24px auto;
}

.gradient-header {
    background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);
    border-radius: 0.75rem;
}
</style>
