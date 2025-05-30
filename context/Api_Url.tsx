const API_BASE_URL = "https://8hrck4nk-7211.uks1.devtunnels.ms/"
import axios from "axios"

interface CreateUserDto {
  firstName: string
  lastName: string
  email: string
  password: string
}

interface CreateAdminRequest {
  createUserDto: CreateUserDto
}

interface DataResponse {
  message: string
  status: boolean
}

interface AdminData {
  id: number
  adminId: string
  firstName: string
  lastName: string
  userName: string
  email: string
  phoneNumber: string
  pictureUrl: string
}

interface CustomerData {
  id: number
  customerId: string
  firstName: string
  lastName: string
  userName: string
  email: string
  phoneNumber: string
  pictureUrl: string
  getNotificationDto: getNotificationDto
  getMeterDto: MeterData[]
}
interface getNotificationDto {
  id: 0
  peakUsageAlerts: boolean
  usageThresholdAlerts: boolean
  usageAlerts: false
  billingNotifications: boolean
  pushNotifications: boolean
}
interface MeterData {
  id: number
  customerName: string
  meterId: string
  meterKey: string
  connectionAuth: string
  totalUnits: number
  consumedUnits: number
  baseLoad: number
  isActive: boolean
  activeLoad: boolean
}

interface MeterUnitAllocationData {
  id: number
  meterId: number
  allocatedUnits: number
  consumedUnits: number
  baseLoad: number
  peakLoad: number
  offPeakLoad: number
  getTransactionDto: {
    date: string
    time: string
    transactionId: string
    rate: number
    baseCharge: number
    taxes: number
    total: number
  }
  unitAllocationStatus: number
}
interface GetPricesResponse {
  data: {
    id: number
    itemName: string
    rate: number
    taxes: number
    baseCharge: number
  }
  message: string
  status: boolean
}

interface LoginResponse {
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
interface ForgotPasswordResponse {
  username: string
  id: number
  message: string
  status: boolean
}
interface AdminResponse {
  data: {
    id: number
    adminId: string
    firstName: string
    lastName: string
    userName: string
    email: string
    phoneNumber: string
    pictureUrl: string
  }
  message: string
  status: boolean
}
interface CustomerResponse {
  data: {
    id: number
    customerId: string
    firstName: string
    lastName: string
    userName: string
    email: string
    phoneNumber: string
    pictureUrl: string
  }
  message: string
  status: boolean
}
interface PriceUpdateDto {
  id: number
  itemName: string
  rate: number
  taxes: number
  baseCharge: number
}
interface MeterPromptResponse {
  id: number
  meterId: number
  title: string
  description: string
  date: string
  type: number
  IsDismissed: boolean
}

export const createAdmin = async (data: CreateAdminRequest): Promise<DataResponse> => {
  try {
    const response = await axios.post<DataResponse>(`${API_BASE_URL}SEMS/Admin/CreateAdmin`, data, {
      headers: { "Content-Type": "application/json" },
    })
    return response.data
  } catch (error) {
    console.error("Error creating admin:", error)
    throw new Error("Failed to create admin")
  }
}

export const getAdminById = async (id: number): Promise<AdminResponse> => {
  try {
    const response = await axios.get<AdminResponse>(`${API_BASE_URL}SEMS/Admin/GetAdminById${id}`, {
      headers: { Accept: "*/*" },
    })
    return response.data
  } catch (error) {
    console.error("Error fetching admin by id:", error)
    throw new Error("Failed to fetch admin data")
  }
}

export const getAllAdmins = async (): Promise<AdminResponse[]> => {
  try {
    const response = await axios.get<AdminResponse[]>(`${API_BASE_URL}SEMS/Admin/GetAllAdmins`)
    return response.data
  } catch (error) {
    console.error("Error fetching all admins:", error)
    throw new Error("Failed to fetch all admins")
  }
}

export const deleteAdmin = async (id: number): Promise<DataResponse> => {
  try {
    const response = await axios.put<DataResponse>(`${API_BASE_URL}SEMS/Admin/DeleteAdmin${id}`)
    return response.data
  } catch (error) {
    console.error("Error deleting admin:", error)
    throw new Error("Failed to delete admin")
  }
}

export const updateAdmin = async (data: AdminData): Promise<DataResponse> => {
  try {
    const response = await axios.put<DataResponse>(`${API_BASE_URL}SEMS/Admin/UpdateAdmin`, data, {
      headers: { "Content-Type": "application/json" },
    })
    return response.data
  } catch (error) {
    console.error("Error updating admin:", error)
    throw new Error("Failed to update admin")
  }
}

export const createCustomer = async (data: CreateAdminRequest): Promise<DataResponse> => {
  try {
    const response = await axios.post<DataResponse>(`${API_BASE_URL}SEMS/Customer/CreateCustomer`, data, {
      headers: { "Content-Type": "application/json" },
    })
    return response.data
  } catch (error) {
    console.error("Error creating customer:", error)
    throw new Error("Failed to create customer")
  }
}
export const updateCustomer = async (data: any): Promise<DataResponse> => {
  try {
    const response = await axios.put<DataResponse>(`${API_BASE_URL}SEMS/Customer/UpdateCustomer`, data, {
      headers: { "Content-Type": "application/json" },
    })
    return response.data
  } catch (error) {
    console.error("Error updating customer:", error)
    throw new Error("Failed to update customer")
  }
}

export const getCustomerById = async (id: number): Promise<CustomerResponse> => {
  try {
    const response = await axios.get<CustomerResponse>(`${API_BASE_URL}SEMS/Customer/GetCustomerById${id}`, {
      headers: { Accept: "*/*" },
    })
    return response.data
  } catch (error) {
    console.error("Error fetching customer by id:", error)
    throw new Error("Failed to fetch customer data")
  }
}

export const getAllCustomers = async (): Promise<CustomerResponse[]> => {
  try {
    const response = await axios.get<CustomerResponse[]>(`${API_BASE_URL}SEMS/Customer/GetAllCustomers`, {
      headers: { Accept: "*/*" },
    })
    return response.data
  } catch (error) {
    console.error("Error fetching all customers:", error)
    throw new Error("Failed to fetch all customers")
  }
}

export const createMeter = async (adminUserId: number): Promise<DataResponse> => {
  try {
    const response = await axios.post<DataResponse>(
      `${API_BASE_URL}SEMS/Meter/CreateMeter`,
      { adminUserId, isActive: false },
      { headers: { "Content-Type": "application/json" } },
    )
    return response.data
  } catch (error) {
    console.error("Error creating meter:", error)
    throw new Error("Failed to create meter")
  }
}

export const attachMeterToCustomer = async (
  meterId: string,
  meterKey: string,
  userId: number,
): Promise<DataResponse> => {
  try {
    if (!meterId || !meterKey || !userId) {
      throw new Error("Meter ID, Meter Key, and User ID are required.")
    }

    const response = await axios.post<DataResponse>(
      `${API_BASE_URL}SEMS/Meter/AttachMeterToCustomer`,
      { meterId, meterKey, userId },
      { headers: { Accept: "*/*", "Content-Type": "application/json" } },
    )

    return response.data
  } catch (error) {
    console.error("Error attaching meter to customer:", error)
    throw new Error("Failed to attach meter to customer")
  }
}

export const updateMeter = async (data: any): Promise<DataResponse> => {
  try {
    const response = await axios.put<DataResponse>(`${API_BASE_URL}SEMS/Meter/UpdateMeter`, data, {
      headers: { "Content-Type": "application/json" },
    })
    return response.data
  } catch (error) {
    console.error("Error updating meter:", error)
    throw new Error("Failed to update meter")
  }
}
export const updateMeterStatus = async (meterId: number): Promise<MeterData> => {
  try {
    const response = await axios.get<MeterData>(`${API_BASE_URL}SEMS/Meter/UpdateMeterStatus${meterId}`)
    return response.data
  } catch (error) {
    console.error("Error fetching all meters:", error)
    throw new Error("Failed to fetch all meters")
  }
}
export const getMeterById = async (meterId: number): Promise<MeterData> => {
  try {
    const response = await axios.get<MeterData>(`${API_BASE_URL}SEMS/Meter/GetMeterById${meterId}`)
    return response.data
  } catch (error) {
    console.error("Error fetching all meters:", error)
    throw new Error("Failed to fetch all meters")
  }
}
export const getMetersByUserId = async (userId: number): Promise<MeterData[]> => {
  try {
    const response = await axios.get<MeterData[]>(`${API_BASE_URL}SEMS/Meter/GetMetersByUserId${userId}`)
    return response.data
  } catch (error) {
    console.error("Error fetching all meters:", error)
    throw new Error("Failed to fetch all meters")
  }
}
export const MeterUnitsData = async (userId: number): Promise<MeterData[]> => {
  try {
    const response = await axios.get<MeterData[]>(`${API_BASE_URL}SEMS/Data/MeterUnitsData${userId}`)
    return response.data
  } catch (error) {
    console.error("Error fetching all meters:", error)
    throw new Error("Failed to fetch all meters")
  }
}

export const getAllMeters = async (): Promise<MeterData[]> => {
  try {
    const response = await axios.get<MeterData[]>(`${API_BASE_URL}SEMS/Meter/GetAllMeters`)
    return response.data
  } catch (error) {
    console.error("Error fetching all meters:", error)
    throw new Error("Failed to fetch all meters")
  }
}

export const updateMeterPrompts = async (meterId: number): Promise<DataResponse> => {
  try {
    const response = await axios.put<DataResponse>(`${API_BASE_URL}SEMS/MeterPrompt/UpdateMeterPrompts${meterId}`)
    return response.data
  } catch (error) {
    console.error("Error updating meter prompts:", error)
    throw new Error("Failed to update meter prompts")
  }
}

export const getMeterPrompts = async (meterId: number): Promise<MeterPromptResponse[]> => {
  try {
    const response = await axios.get<MeterPromptResponse[]>(`${API_BASE_URL}SEMS/MeterPrompt/GetMeterPrompts${meterId}`)
    return response
  } catch (error) {
    console.error("Error getting meter prompts:", error)
    throw new Error("Failed to get meter prompts")
  }
}

export const createMeterUnitAllocation = async (id: number, amount: number): Promise<DataResponse> => {
  try {
    const response = await axios.post<DataResponse>(
      `${API_BASE_URL}SEMS/MeterUnitAllocation/CreateMeterUnitAllocation?id=${id}&amount=${amount}`,
    )
    return response
  } catch (error) {
    console.error("Error creating meter unit allocation:", error)
    throw new Error("Failed to create meter unit allocation")
  }
}

export const getMeterUnitAllocationById = async (meterId: number): Promise<MeterUnitAllocationData[]> => {
  try {
    const response = await axios.get<MeterUnitAllocationData[]>(
      `${API_BASE_URL}SEMS/MeterUnitAllocation/GetMeterUnitAllocationById?meterId=${meterId}`,
      { headers: { Accept: "*/*" } },
    )
    return response.data
  } catch (error) {
    console.error("Error fetching meter unit allocation by id:", error)
    throw new Error("Failed to fetch meter unit allocation")
  }
}

export const updatePrices = async (data: PriceUpdateDto): Promise<DataResponse> => {
  try {
    const response = await axios.put<DataResponse>(`${API_BASE_URL}SEMS/Prices/UpdatePrices`, data, {
      headers: { "Content-Type": "application/json" },
    })
    return response.data
  } catch (error) {
    console.error("Error updating prices:", error)
    throw new Error("Failed to update prices")
  }
}

export const getPrices = async (): Promise<GetPricesResponse[]> => {
  try {
    const response = await axios.get<GetPricesResponse[]>(`${API_BASE_URL}SEMS/Prices/GetPrices`)
    return response.data
  } catch (error) {
    console.error("Error fetching prices:", error)
    throw new Error("Failed to fetch prices")
  }
}

export const checkUserName = async (username: string): Promise<boolean> => {
  try {
    const response = await axios.get<boolean>(`${API_BASE_URL}SEMS/User/CheckUserName?username=${username}`)
    return response.data
  } catch (error) {
    console.error("Error checking username:", error)
    throw new Error("Failed to check username")
  }
}

export const loginUser = async (username: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await axios.post<LoginResponse>(
      `${API_BASE_URL}SEMS/User/Login?username=${username}&password=${password}`,
    )
    return response.data
  } catch (error) {
    console.error("Error logging in user:", error)
    throw new Error("Failed to log in user")
  }
}

export const forgotPassword = async (email: string): Promise<ForgotPasswordResponse> => {
  try {
    const response = await axios.post<ForgotPasswordResponse>(
      `${API_BASE_URL}SEMS/User/ForgotPassword?email=${encodeURIComponent(email)}`,
      null,
      { headers: { Accept: "*/*" } },
    )
    return response.data
  } catch (error) {
    console.error("Error sending password reset email:", error)
    throw new Error("Failed to send password reset email")
  }
}

export const changePassword = async (id: number, username: string, password: string): Promise<DataResponse> => {
  try {
    const response = await axios.put<DataResponse>(
      `${API_BASE_URL}SEMS/User/ChangePassword?id=${id}&username=${username}&password=${password}`,
      { headers: { Accept: "*/*" } },
    )
    return response.data
  } catch (error) {
    console.error("Error changing password:", error)
    throw new Error("Failed to change password")
  }
}

const apiMethods = {
  createAdmin,
  getAdminById,
  getAllAdmins,
  deleteAdmin,
  updateAdmin,
  createCustomer,
  updateCustomer,
  getCustomerById,
  getAllCustomers,
  createMeter,
  updateMeter,
  getMeterById,
  getMetersByUserId,
  attachMeterToCustomer,
  getAllMeters,
  MeterUnitsData,
  updateMeterPrompts,
  getMeterPrompts,
  createMeterUnitAllocation,
  getMeterUnitAllocationById,
  updatePrices,
  getPrices,
  checkUserName,
  loginUser,
  forgotPassword,
  changePassword,
}

export default apiMethods
