<template>
    <div class="container mt-4">
        <div class="card shadow-lg rounded-4">

            <!-- HEADER -->
            <div class="card-header text-white rounded-top-4 py-3"
                style="background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);">
                <h4 class="mb-0 text-center text-lg-start fw-bold d-flex align-items-center gap-2">
                    <i class="fas fa-user-circle"></i>
                    Thông tin tài khoản
                </h4>
            </div>

            <div class="card-body p-4">

                <form @submit.prevent="submit" class="row g-3">

                    <!-- Họ lót -->
                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Họ lót</label>
                        <input v-model="form.HoLot" class="form-control rounded-pill" required />
                    </div>

                    <!-- Tên -->
                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Tên</label>
                        <input v-model="form.Ten" class="form-control rounded-pill" required />
                    </div>

                    <!-- Ngày sinh -->
                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Ngày sinh</label>
                        <input type="date" v-model="form.NgaySinh" class="form-control rounded-pill" />
                    </div>

                    <!-- Giới tính -->
                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Phái</label>
                        <select v-model="form.Phai" class="form-control rounded-pill">
                            <option>Nam</option>
                            <option>Nữ</option>
                        </select>
                    </div>

                    <!-- Địa chỉ -->
                    <div class="col-12">
                        <label class="form-label fw-semibold">Địa chỉ</label>
                        <input v-model="form.DIACHI" class="form-control rounded-pill" />
                    </div>

                    <!-- Số điện thoại -->
                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Số điện thoại</label>
                        <input v-model="form.DienThoai" class="form-control rounded-pill" required />
                    </div>

                    <!-- Mật khẩu -->
                    <div class="col-md-6">
                        <label class="form-label fw-semibold">
                            Đổi mật khẩu
                            <small class="text-muted">(để trống nếu không đổi)</small>
                        </label>
                        <input type="password" v-model="form.Password" class="form-control rounded-pill" />
                    </div>

                    <!-- Nút lưu -->
                    <div class="col-12 text-center mt-3">
                        <button class="btn btn-success px-4 py-2 rounded-pill shadow-sm hover-scale">
                            <i class="fas fa-save me-1"></i> Lưu thay đổi
                        </button>
                    </div>

                    <!-- Thông báo -->
                    <div v-if="errorMsg" class="text-danger text-center mt-2">
                        {{ errorMsg }}
                    </div>

                    <div v-if="successMsg" class="text-success text-center mt-2">
                        {{ successMsg }}
                    </div>

                </form>

            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import api from '../api'
import { useRouter } from 'vue-router'

const router = useRouter()
const form = reactive({ HoLot: '', Ten: '', NgaySinh: '', Phai: 'Nam', DIACHI: '', DienThoai: '', Password: '' })
const errorMsg = ref('')
const successMsg = ref('')

const load = async () => {
    try {
        const res = await api.get('/readers/me')
        const data = res.data
        form.HoLot = data.HOLOT || data.HoLot || ''
        form.Ten = data.TEN || data.Ten || ''
        form.NgaySinh = data.NGAYSINH || data.NgaySinh || ''
        form.Phai = data.PHAI || data.Phai || 'Nam'
        form.DIACHI = data.DIACHI || data.DIACHI || ''
        form.DienThoai = data.DIENTHOAI || data.DienThoai || ''
    } catch (e) {
        if (e?.response?.status === 401) router.push('/login')
    }
}

const submit = async () => {
    errorMsg.value = ''
    successMsg.value = ''
    try {
        const payload = {
            HoLot: form.HoLot,
            Ten: form.Ten,
            NgaySinh: form.NgaySinh,
            Phai: form.Phai,
            DIACHI: form.DIACHI,
            DienThoai: form.DienThoai,
        }
        if (form.Password) payload.Password = form.Password
        await api.put('/readers/me', payload)
        successMsg.value = 'Cập nhật thành công'
    } catch (e) {
        errorMsg.value = e?.response?.data?.message || 'Lỗi cập nhật'
    }
}

onMounted(load)
</script>

<style scoped>
.hover-scale {
    transition: 0.2s ease;
}

.hover-scale:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
}
</style>
