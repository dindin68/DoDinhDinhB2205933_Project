<template>
    <div class="container mx-0">
        <div class="card shadow-lg border-0" style="background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);">
            <div class="card-body p-4 p-md-5"
                style="background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);  border-radius: 0.5rem;">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2 class="text-white font-weight-bold">Quản Lý Nhà Xuất Bản</h2>
                    <button @click="$router.push('/publishers/create')" class="btn btn-success btn-lg">
                        + Thêm NXB mới
                    </button>
                </div>

                <div class="card shadow" style="border-radius: 0.5rem;">
                    <div class="table-responsive">
                        <table class="table table-hover mb-0 align-middle text-center">
                            <thead style="background: linear-gradient(90deg, #6366f1, #8b5cf6); color: white;">
                                <tr>
                                    <th>Mã NXB</th>
                                    <th>Tên NXB</th>
                                    <th>Địa chỉ</th>
                                    <th class="text-center">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="publisher in publishers" :key="publisher._id">
                                    <td><strong>{{ publisher.MaNXB }}</strong></td>
                                    <td class="font-weight-bold">{{ publisher.TenNXB }}</td>
                                    <td>{{ publisher.DiaChi }}</td>
                                    <td class="text-center">
                                        <button @click="$router.push(`/publishers/edit/${publisher.MaNXB}`)"
                                            class="btn btn-warning btn-sm mr-2">Sửa</button>
                                        <button @click="deletePublisher(publisher.MaNXB)"
                                            class="btn btn-danger btn-sm">Xóa</button>
                                    </td>
                                </tr>
                                <tr v-if="!publishers.length">
                                    <td colspan="5" class="text-center text-muted py-4">
                                        Chưa có nhà xuất bản nào. Hãy thêm NXB đầu tiên!
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

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'

const publishers = ref([])
const router = useRouter()

const fetchPublishers = async () => {
    const res = await api.get('/publishers')
    publishers.value = res.data
}

const deletePublisher = async (id) => {
    if (confirm('Xóa nhà xuất bản này?')) {
        await api.delete(`/publishers/${id}`)
        fetchPublishers()
    }
}

onMounted(fetch - publishers)
</script>