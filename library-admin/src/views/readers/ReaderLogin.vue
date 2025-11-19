<template>
    <div class="min-h-screen flex items-center justify-center">
        <div class="w-full max-w-md bg-white p-6 rounded-lg shadow">
            <h2 class="text-2xl font-bold mb-4">Đăng nhập độc giả</h2>
            <form @submit.prevent="submit">
                <div class="mb-3">
                    <label class="block text-sm">Số điện thoại</label>
                    <input v-model="form.phone" required class="w-full px-3 py-2 border rounded" />
                </div>
                <div class="mb-3">
                    <label class="block text-sm">Mật khẩu</label>
                    <input v-model="form.password" type="password" required class="w-full px-3 py-2 border rounded" />
                </div>
                <div class="flex items-center justify-between">
                    <button class="bg-indigo-600 text-white px-4 py-2 rounded">Đăng nhập</button>
                    <router-link to="/reader/register" class="text-sm text-gray-500">Chưa có tài khoản? Đăng
                        ký</router-link>
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
const form = reactive({ phone: '', password: '' })

const submit = async () => {
    try {
        const res = await api.post('/auth/login', form)
        const { token, user } = res.data
        localStorage.setItem('token', token)
        localStorage.setItem('readerUser', JSON.stringify(user))
        alert('Đăng nhập thành công')
        router.push('/')
    } catch (err) {
        console.error(err)
        alert(err?.response?.data?.message || 'Lỗi đăng nhập')
    }
}
</script>

<style scoped>
.min-h-screen {
    min-height: 100vh;
}
</style>
