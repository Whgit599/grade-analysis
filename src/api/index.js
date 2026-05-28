const API_BASE = import.meta.env.VITE_API_BASE || '/api'

const request = async (url, options = {}) => {
    const res = await fetch(`${API_BASE}${url}`, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.message || `请求失败：${res.status}`)
    return data
}

const api = {
    get: (url) => request(url, { method: 'GET' }),
    post: (url, data = {}) => request(url, { method: 'POST', body: JSON.stringify(data) }),
    put: (url, data = {}) => request(url, { method: 'PUT', body: JSON.stringify(data) }),
    del: (url) => request(url, { method: 'DELETE' })
}

export default api
