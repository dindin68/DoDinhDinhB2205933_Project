<template>
    <div class="container mt-3">
        <div class="card shadow-lg border-0 rounded-lg">

            <!-- ✅ HEADER MỚI -->
            <div class="card-header text-white"
                style="background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899); border-radius: 0.5rem;">

                <div class="row align-items-center g-2">

                    <!-- TIÊU ĐỀ -->
                    <div class="col-12 col-md-3">
                        <h3 class="mb-0 text-center text-md-start">
                            <i class="fas fa-building mr-2"></i>
                            Quản lý NXB
                        </h3>
                    </div>

                    <!-- ✅ SEARCH BAR CHUẨN ĐÃ LƯU -->
                    <div class="col-12 col-md-8">
                        <div class="input-group shadow-sm">
                            <input v-model="q" type="text" class="form-control border-0 py-2"
                                style="border-radius: 50rem;" placeholder="Tìm mã NXB, tên NXB, địa chỉ...">
                        </div>
                    </div>

                    <!-- ✅ NÚT + ICON -->
                    <div class="col-12 col-md-1 text-end">
                        <router-link to="/publishers/create"
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
                                <th>Mã NXB</th>
                                <th>Tên NXB</th>
                                <th>Địa chỉ</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr v-for="publisher in filteredPublishers" :key="publisher._id || publisher.MANXB">

                                <td class="text-primary font-weight-bold">
                                    {{ publisher.MANXB }}
                                </td>

                                <td class="font-weight-bold">
                                    {{ publisher.TENNXB }}
                                </td>

                                <td class="text-truncate" style="max-width: 200px;">
                                    {{ publisher.DIACHI }}
                                </td>

                                <td>
                                    <div class="d-flex justify-content-center flex-column flex-sm-row">

                                        <button @click="$router.push(`/publishers/edit/${publisher.MANXB}`)"
                                            class="btn btn-warning btn-sm mb-1 mb-sm-0 mr-sm-1 btn-action">
                                            <i class="fas fa-edit"></i>
                                        </button>

                                        <button @click="deletePublisher(publisher.MANXB)"
                                            class="btn btn-danger btn-sm btn-action">
                                            <i class="fas fa-trash-alt"></i>
                                        </button>

                                    </div>
                                </td>
                            </tr>

                            <tr v-if="!filteredPublishers.length">
                                <td colspan="4" class="text-center text-muted py-3">
                                    Không có nhà xuất bản nào.
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

const publishers = ref([])
const q = ref('')

// Fetch
const fetchPublishers = async () => {
    try {
        const res = await api.get('/publishers')
        publishers.value = res.data
    } catch (err) {
        console.error(err)
    }
}

const deletePublisher = async (id) => {
    if (confirm('Xóa nhà xuất bản này?')) {
        await api.delete(`/publishers/${id}`)
        fetchPublishers()
    }
}

// ✅ LỌC THEO SEARCH
const filteredPublishers = computed(() => {
    if (!q.value) return publishers.value

    const t = q.value.toLowerCase()
    return publishers.value.filter(p =>
        (p.MANXB || '').toLowerCase().includes(t) ||
        (p.TENNXB || '').toLowerCase().includes(t) ||
        (p.DIACHI || '').toLowerCase().includes(t)
    )
})

onMounted(fetchPublishers)
</script>


<style scoped>
.btn-sm {
    font-size: 0.85rem;
}

.badge {
    font-size: 0.9rem;
    padding: 0.5em 0.7em;
}
</style>
