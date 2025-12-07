<template>
    <div class="container mt-5">
        <div class="card shadow-lg border-0 rounded-lg">

            <!-- HEADER -->
            <div class="card-header text-white d-flex align-items-center justify-content-between"
                style="background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);  border-radius: 0.5rem;">
                <h3 class=" mb-0">{{ isEdit ? 'Sửa Sách' : 'Thêm Sách Mới' }}</h3>
                <i class="fas fa-book fa-lg"></i>
            </div>

            <!-- BODY -->
            <div class="card-body bg-white p-5 rounded-bottom">
                <form @submit.prevent="saveBook">

                    <div class="form-group mb-4">
                        <label class="font-weight-bold">Mã sách</label>
                        <div class="input-group">
                            <div class="input-group-prepend">
                                <span class="input-group-text"><i class="fas fa-hashtag"></i></span>
                            </div>
                            <input v-model="book.MaSach" type="text" class="form-control form-control-lg"
                                :disabled="isEdit" required>
                        </div>
                    </div>

                    <div class="form-group mb-4">
                        <label class="font-weight-bold">Tên sách</label>
                        <div class="input-group">
                            <div class="input-group-prepend">
                                <span class="input-group-text"><i class="fas fa-book"></i></span>
                            </div>
                            <input v-model="book.TenSach" type="text" class="form-control form-control-lg" required>
                        </div>
                    </div>

                    <div class="form-group mb-4">
                        <label class="font-weight-bold">Tác giả</label>
                        <div class="input-group">
                            <div class="input-group-prepend">
                                <span class="input-group-text"><i class="fas fa-user"></i></span>
                            </div>
                            <input v-model="book.TacGia" type="text" class="form-control form-control-lg" required>
                        </div>
                    </div>

                    <div class="form-group mb-4">
                        <label class="font-weight-bold">Nhà xuất bản</label>
                        <div class="input-group">
                            <div class="input-group-prepend">
                                <span class="input-group-text"><i class="fas fa-building"></i></span>
                            </div>
                            <select v-model="book.NhaXuatBan" class="form-control form-control-lg" required>
                                <option value="" disabled>-- Chọn Nhà Xuất Bản --</option>
                                <option v-for="publisher in publishers" :key="publisher._id" :value="publisher._id">
                                    {{ publisher.TENNXB }}
                                </option>
                                <option value="new">-- Thêm Nhà Xuất Bản Mới --</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group mb-4" v-if="book.NhaXuatBan === 'new'">
                        <label class="font-weight-bold">Tên Nhà Xuất Bản Mới</label>
                        <div class="input-group">
                            <div class="input-group-prepend">
                                <span class="input-group-text"><i class="fas fa-edit"></i></span>
                            </div>
                            <input v-model="newPublisherName" type="text" class="form-control form-control-lg"
                                placeholder="Nhập tên Nhà Xuất Bản mới..." required>
                        </div>
                    </div>
                    <div class="form-group mb-4" v-if="book.NhaXuatBan === 'new'">
                        <label class="font-weight-bold">Địa chỉ Nhà Xuất Bản</label>
                        <div class="input-group">
                            <div class="input-group-prepend">
                                <span class="input-group-text"><i class="fas fa-map-marker-alt"></i></span>
                            </div>
                            <input v-model="newPublisherAddress" type="text" class="form-control form-control-lg"
                                placeholder="Nhập địa chỉ NXB mới..." required>
                        </div>
                    </div>

                    <div class="form-group mb-4">
                        <label class="font-weight-bold">Năm xuất bản</label>
                        <div class="input-group">
                            <div class="input-group-prepend">
                                <span class="input-group-text"><i class="fas fa-calendar-alt"></i></span>
                            </div>
                            <input v-model="book.NamXuatBan" type="number" class="form-control form-control-lg"
                                required>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group mb-4">
                                <label class="font-weight-bold">Đơn giá (VND)</label>
                                <div class="input-group">
                                    <div class="input-group-prepend">
                                        <span class="input-group-text"><i class="fas fa-tag"></i></span>
                                    </div>
                                    <input v-model="book.DONGIA" type="number" min="0"
                                        class="form-control form-control-lg" required>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-6">
                            <div class="form-group mb-4">
                                <label class="font-weight-bold">Số quyển</label>
                                <div class="input-group">
                                    <div class="input-group-prepend">
                                        <span class="input-group-text"><i class="fas fa-layer-group"></i></span>
                                    </div>
                                    <input v-model="book.SOQUYEN" type="number" min="0"
                                        class="form-control form-control-lg" required>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="form-group mb-4">
                        <label class="font-weight-bold">Ảnh sách</label>
                        <input type="file" @change="handleFileUpload" class="form-control">
                    </div>

                    <div class="d-flex justify-content-end mt-4">
                        <button type="button" @click="$router.go(-1)" class="btn btn-secondary btn-lg mr-3">
                            <i class="fas fa-times mr-1"></i> Hủy
                        </button>
                        <button type="submit" class="btn btn-primary btn-lg px-5" :disabled="isSaving">
                            <i class="fas fa-save mr-1"></i> Lưu
                        </button>
                    </div>

                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'


const route = useRoute()
const router = useRouter()
const isEdit = route.params.id !== undefined
const isSaving = ref(false)



// DATA CƠ BẢN CỦA SÁCH
const book = ref({
    MaSach: '',
    TenSach: '',
    TacGia: '',
    NamXuatBan: '',
    DONGIA: 0,
    SOQUYEN: 0,
    NhaXuatBan: ''
})
// Watch để reset tên NXB mới khi người dùng đổi lựa chọn

watch(() => book.value.NhaXuatBan, (val) => {
    if (val === 'new') {
        newPublisherName.value = ''
        newPublisherAddress.value = ''
    }
})
const imageFile = ref(null)
const handleFileUpload = (e) => { imageFile.value = e.target.files[0] }

// DATA VỀ NHÀ XUẤT BẢN
const publishers = ref([]) // Danh sách NXB được tải từ API
const newPublisherName = ref('')
const newPublisherAddress = ref('') // Tên NXB mới nếu người dùng chọn 'Thêm mới'

// HÀM TẢI DANH SÁCH NXB
const fetchPublishers = async () => {
    try {
        const res = await api.get('/publishers')
        publishers.value = res.data
    } catch (error) {
        console.error('Lỗi khi tải danh sách Nhà Xuất Bản:', error)
    }
}

const fetchBook = async () => {
    if (isEdit) {
        try {
            const res = await api.get(`/books/${route.params.id}`)
            book.value = res.data
        } catch (err) {
            console.error('Lỗi khi tải dữ liệu sách:', err)
        }
    }
}

const createNewPublisher = async (name) => {
    try {
        const res = await api.post('/publishers', {
            TENNXB: name,
            DIACHI: newPublisherAddress.value
        })

        if (res.data && res.data._id) {
            return res.data._id
        } else {
            console.error('API tạo NXB thành công nhưng thiếu _id:', res.data);
            throw new Error('API server không trả về ID Nhà Xuất Bản mới.');
        }

    } catch (error) {
        console.error('Lỗi khi tạo Nhà Xuất Bản mới:', error)
        throw new Error(error.response?.data?.message || 'Không thể tạo Nhà Xuất Bản mới.')
    }
}

// HÀM LƯU SÁCH ĐÃ ĐIỀU CHỈNH (CÓ THAY ĐỔI)
const saveBook = async () => {
    try {
        const formData = new FormData()
        formData.append('MaSach', book.value.MaSach)
        formData.append('TenSach', book.value.TenSach)
        formData.append('TacGia', book.value.TacGia)
        formData.append('DONGIA', Number(book.value.DONGIA))
        formData.append('SOQUYEN', Number(book.value.SOQUYEN))
        formData.append('NamXuatBan', Number(book.value.NamXuatBan))


        let publisherIdToSave = typeof book.value.NhaXuatBan === 'object'
            ? book.value.NhaXuatBan._id
            : book.value.NhaXuatBan



        //KIỂM TRA VÀ TẠO NXB MỚI
        if (book.value.NhaXuatBan === 'new') {
            if (!newPublisherName.value) {
                alert('Vui lòng nhập tên Nhà xuất bản mới.')
                return
            }

            try {
                // Gọi API để tạo NXB mới và lấy ID
                const newId = await createNewPublisher(newPublisherName.value)
                publisherIdToSave = newId // Sử dụng ID NXB mới tạo
            } catch (error) {
                // Nếu createNewPublisher throw lỗi, catch sẽ bắt và hiển thị
                alert(error.message);
                return;
            }
        }

        //Gửi ID của NXB đã có hoặc ID mới tạo đi
        // Sử dụng MANXB để map với collection SACH
        formData.append('MANXB', publisherIdToSave || '')

        if (imageFile.value) formData.append('image', imageFile.value)

        if (isEdit) {
            await api.put(`/books/${route.params.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
        } else {
            await api.post('/books', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
        }

        router.push('/books')
    } catch (err) {
        alert(err.response?.data?.message || 'Lỗi lưu sách. Vui lòng kiểm tra dữ liệu nhập.')
    }
}

onMounted(() => {
    fetchPublishers() // Tải danh sách NXB khi component được tạo
    fetchBook()
})
</script>

<style scoped>
.card-header h3 {
    font-weight: 700;
}

.input-group-text {
    background-color: #f1f1f1;
}

.btn:hover {
    opacity: 0.9;
}

.card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.card-body {
    background-color: #fff;
}
</style>
