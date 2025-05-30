export interface LoginResponse {
  data: {
    id: number
    firstName: string | null
    lastName: string | null
    email: string
    userName: string
    roleName: string
  }
  token: string | null
  message: string
  status: boolean
}

export interface ForgotPasswordResponse {
  username: string
  id: number
  message: string
  status: boolean
}
