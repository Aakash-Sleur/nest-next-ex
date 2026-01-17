<script setup lang="ts">
import {ref} from "vue"
import axios from "axios";

const email = ref("")
const password = ref("")
const loading = ref(false)
const error = ref<string | null>(null)

const login = async () => {
    error.value = null
    loading.value = true

    try {
        const res = await axios.post("http://localhost:3000/auth/login", {
            email: email.value,
            password: password.value
        })

    localStorage.setItem("access_token", res.data.access_token)

    window.location.href = "/dashboard"    
    } catch (err) {
        error.value = err.response?.data?.message || "Login Failed"
    } finally {
        loading.value = false
    }
}

</script>

<template>
    <div class="auth-card">
        <h1>Login</h1>

        <form @submit.prevent="login">
            <input type="email" v-model="email" placeholder="Email" required>
            <input type="password" v-model="password" placeholder="Password" required>
            <button :disabled="loading">
                {{ loading ? "Logging in..." : "Login" }}
            </button>

            <p v-if="error" class="error">{{ error }}</p>
        </form>
    </div>
</template>

<style scoped>
.auth-card {
  max-width: 360px;
  margin: auto;
  padding: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}
input {
  width: 100%;
  margin-bottom: 12px;
  padding: 10px;
}
button {
  width: 100%;
  padding: 10px;
}
.error {
  color: red;
  margin-top: 8px;
}
</style>