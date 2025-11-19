<template>
    <div class="min-h-screen flex items-center justify-center">
        <div class="w-full max-w-lg bg-white p-6 rounded-lg shadow">
            <h2 class="text-2xl font-bold mb-4">Đăng ký độc giả</h2>
            <form @submit.prevent="submit">
                <div class="mb-3">
                    <label class="block text-sm">Họ và tên</label>
                    <input v-model="form.TenDocGia" required class="w-full px-3 py-2 border rounded" />
                </div>
                <div class="mb-3">
                    <label class="block text-sm">Số điện thoại</label>
                    <input v-model="form.DienThoai" required class="w-full px-3 py-2 border rounded" />
                </div>
                <div class="mb-3">
                    <label class="block text-sm">Mật khẩu</label>
                    <input v-model="form.Password" type="password" required class="w-full px-3 py-2 border rounded" />
                </div>
                <div class="flex items-center justify-between">
                    <button class="bg-indigo-600 text-white px-4 py-2 rounded">Đăng ký</button>
                    <router-link to="/reader/login" class="text-sm text-gray-500">Đã có tài khoản? Đăng
                        nhập</router-link>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { reactive } from 'vue'
import api from '@/api'
import { useRouter } from 'vue-router'

const router = useRouter()
const form = reactive({ TenDocGia: '', DienThoai: '', Password: '' })

const submit = async () => {
    try {
        await api.post('/readers', form)
        alert('Đăng ký thành công. Vui lòng đăng nhập')
        router.push('/reader/login')
    } catch (err) {
        console.error(err)
        alert(err?.response?.data?.message || 'Lỗi khi đăng ký')
    }
}
</script>

<style scoped>
.min-h-screen {
    min-height: 100vh;
}
</style>
