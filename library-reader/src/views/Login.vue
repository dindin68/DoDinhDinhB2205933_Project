<template>
    <div class="container">
        <h2>Đăng nhập</h2>
        <form @submit.prevent="submit">
            <div>
                <label>Số điện thoại</label>
                <input v-model="form.phone" required />
            </div>
            <div>
                <label>Mật khẩu</label>
                <input type="password" v-model="form.password" required />
            </div>
            <button>Đăng nhập</button>
        </form>
    </div>
</template>

<script setup>
import { reactive } from 'vue'
import api from '../api'
import { useRouter } from 'vue-router'

const router = useRouter()
const form = reactive({ phone: '', password: '' })

const submit = async () => {
    try {
        const res = await api.post('/auth/login', { phone: form.phone, password: form.password })
        const { token, employee, message } = res.data
        // Save token for reader flows; backend currently returns employee for admin, but token handling is shared
        localStorage.setItem('token', token)
        alert(message || 'Đăng nhập thành công')
        router.push('/')
    } catch (e) {
        alert(e?.response?.data?.message || 'Lỗi đăng nhập')
    }
}
</script>

<style scoped>
.container {
    max-width: 600px;
    margin: 48px auto;
    padding: 16px;
    background: white;
    border-radius: 6px
}

input {
    width: 100%;
    padding: 8px;
    margin: 6px 0
}

button {
    padding: 8px 12px;
    background: #10b981;
    color: white;
    border: none;
    border-radius: 4px
}
</style>
