<template>
    <div class="container mx-0">
        <div class=" card shadow-lg border-0" style=" border-radius: 0.5rem;">
            <div class="card-body p-4 p-md-5"
                style="background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);  border-radius: 0.5rem;">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2 class="text-white font-weight-bold">Quản Lý Độc giả</h2>
                    <button @click="$router.push('/readers/create')" class="btn btn-light btn-lg font-weight-bold">
                        + Thêm độc giả mới
                    </button>
                </div>

                <div class="card shadow" style="border-radius: 0.5rem;">
                    <div class="table-responsive">
                        <table class="table table-hover mb-0 align-middle">
                            <thead style="background: linear-gradient(90deg, #6366f1, #8b5cf6); color: white;">
                                <tr class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center">
                                    <th>Mã độc giả</th>
                                    <th>Họ lót</th>
                                    <th>Tên</th>
                                    <th>Ngày sinh</th>
                                    <th>Phái</th>
                                    <th>Địa chỉ</th>
                                    <th>Điện thoại</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="reader in readers" :key="reader._id"
                                    class="border-b hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition">
                                    <td class="px-8 py-6 font-mono text-indigo-600 font-bold text-lg">{{ reader.MaDocGia
                                    }}
                                    </td>
                                    <td class="px-8 py-6 font-semibold text-gray-800">{{ reader.HoLot }}</td>
                                    <td class="px-8 py-6 text-gray-800">{{ reader.Ten }}</td>
                                    <td class="px-8 py-6 text-gray-600">{{ formatDate(reader.NgaySinh) }}</td>
                                    <td class="px-8 py-6 text-gray-600">{{ reader.Phai }}</td>
                                    <td class="px-8 py-6 text-gray-600">{{ reader.DiaChi }}</td>
                                    <td class="px-8 py-6 text-gray-600">{{ reader.DienThoai }}</td>
                                    <td class="px-8 py-6 text-center space-x-4">
                                        <button @click="$router.push(`/readers/edit/${reader.MaDocGia}`)"
                                            class="text-blue-600 hover:text-blue-800 font-medium transition">
                                            ✏️ Sửa
                                        </button>
                                        <button @click="deleteReader(reader.MaDocGia)"
                                            class="text-red-600 hover:text-red-800 font-medium transition">
                                            🗑️ Xóa
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <div v-if="!readers.length" colspan="5" class="text-center text-muted py-4">
                            Chưa có độc giả nào. Hãy thêm độc giả đầu tiên!
                        </div>
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

const readers = ref([])
const router = useRouter()

const fetchReaders = async () => {
    const res = await api.get('/readers')
    readers.value = res.data
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

onMounted(fetchReaders)
</script>