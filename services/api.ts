// This file contains API service functions for the smart meter app
// Replace the API_BASE_URL with your actual API endpoint
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.example.com"
import * as API from "@/context/Api_Url"
/**
 * Fetch user meters from the API
 * @param userId The ID of the user
 * @returns Array of meter data

export async function fetchUserMeters(userId: string) {
  try {
    // Replace this with your actual API endpoint
    const response = await fetch(`${API_BASE_URL}/users/${userId}/meters`)

    if (!response.ok) {
      throw new Error(`Failed to fetch meters: ${response.status}`)
    }

    return response
  } catch (error) {
    console.error("Error fetching user meters:", error)
    // Return null to allow fallback to sample data
    return null
  }
}
 */
/**
 * Fetch notifications for a specific meter
 * @param meterId The ID of the meter
 * @returns Array of notifications
 */
export async function fetchMeterNotifications(meterId: int) {
  try {
    // Replace this with your actual API endpoint
    const response = await API.getMeterPrompts(meterId)
    console.log(response)
    if (!response.data.status) {
      throw new Error(`Failed to fetch notifications: ${response.status}`)
    }
    return response.data
  } catch (error) {
    console.error("Error fetching meter notifications:", error)
    // Return null to allow fallback to sample data
    return null
  }
}

/**
 * Fetch billing history for a specific meter
 * @param meterId The ID of the meter
 * @returns Array of billing history items
 */
export async function fetchBillingHistory(meterId: string) {
  try {
    // Replace this with your actual API endpoint
    const response = await API.getMeterUnitAllocationById(Number(meterId))
    console.log(response.data)
    if (!response.status) {
      throw new Error(`Failed to fetch billing history: ${response.status}`)
    }
    return response
  } catch (error) {
    console.error("Error fetching billing history:", error)
    // Return null to allow fallback to sample data
    return null
  }
}

export async function fetchUnitPrice() {
  try {
    // Replace this with your actual API endpoint
    const response = await API.getPrices()
    if (!response.status) {
      throw new Error(`Failed to fetch unit price: ${response.data.rate}`)
    }
    return response.data
  } catch (error) {
    console.error("Error fetching unit price:", error)
    // Return default price data
    return { price: 0.47 }
  }
}
