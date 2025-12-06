<template>
    <div class="container">
        <h2>Thông tin tài khoản</h2>
        <form @submit.prevent="submit">
            <div>
                <label>Họ lót</label>
                <input v-model="form.HoLot" required />
            </div>
            <div>
                <label>Tên</label>
                <input v-model="form.Ten" required />
            </div>
            <div>
                <label>Ngày sinh</label>
                <input type="date" v-model="form.NgaySinh" />
            </div>
            <div>
                <label>Phái</label>
                <select v-model="form.Phai">
                    <option>Nam</option>
                    <option>Nữ</option>
                </select>
            </div>
            <div>
                <label>Địa chỉ</label>
                <input v-model="form.DIACHI" />
            </div>
            <div>
                <label>Số điện thoại</label>
                <input v-model="form.DienThoai" required />
            </div>
            <div>
                <label>Đổi mật khẩu (để trống nếu không đổi)</label>
                <input type="password" v-model="form.Password" />
            </div>
            <div style="margin-top:12px">
                <button> Lưu thay đổi </button>
            </div>
            <div v-if="errorMsg" style="color:red; margin-top:8px">{{ errorMsg }}</div>
            <div v-if="successMsg" style="color:green; margin-top:8px">{{ successMsg }}</div>
        </form>
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
        console.error(e)
        // redirect to login if unauthorized
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
        const res = await api.put('/readers/me', payload)
        successMsg.value = 'Cập nhật thành công'
    } catch (e) {
        errorMsg.value = e?.response?.data?.message || 'Lỗi cập nhật'
    }
}

onMounted(load)
</script>

<style scoped>
.container {
    max-width: 600px;
    margin: 40px auto
}

input,
select {
    width: 100%;
    padding: 8px;
    margin: 6px 0
}

button {
    background: #10b981;
    color: white;
    padding: 8px 12px;
    border: none;
    border-radius: 4px
}
</style>
