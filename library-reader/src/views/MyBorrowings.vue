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
                    <h5 class="card-title">
                        {{ b.MaMuon || b._id }}
                    </h5>

                    <p class="card-text mb-1">
                        <strong>Mã sách:</strong> {{ b.MaSach }}
                    </p>

                    <p class="card-text">
                        <strong>Trạng thái:</strong>
                        <span :class="statusClass(b.TrangThai)">
                            {{ b.TrangThai }}
                        </span>
                    </p>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api'

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
    { label: "Quá hạn", value: "QuaHan" },
]

// Lọc danh sách theo trạng thái
const filteredItems = computed(() => {
    if (filterStatus.value === "all") return items.value
    return items.value.filter(b => b.TrangThai === filterStatus.value)
})

const token = localStorage.getItem('reader_token') || ''

const load = async () => {
    loading.value = true
    try {
        if (!token) {
            window.location.href = '/login'
            return
        }
        const res = await api.get('/borrowings/me')
        items.value = res.data || []
    } catch (e) {
        console.error(e)
        alert('Lỗi khi tải phiếu mượn')
    } finally {
        loading.value = false
    }
}

onMounted(load)

// CSS class theo trạng thái
const statusClass = (st) => {
    return {
        "badge badge-secondary": st === "ChoDuyet",
        "badge badge-danger": st === "KhongDuyet",
        "badge badge-info": st === "DaDuyet",
        "badge badge-primary": st === "DaMuon",
        "badge badge-success": st === "DaTra",
        "badge badge-warning text-dark": st === "QuaHan",
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
