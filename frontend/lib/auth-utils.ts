export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem("auth_token", token)
    document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Lax`
  }
}

export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem("auth_token")
  }
  return null
}

export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem("auth_token")
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  }
}
