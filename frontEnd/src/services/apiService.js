/**
 * Service for interacting with the Firebase CRUD API
 */
import { sendSlackMessage, formatSlackInventoryAlert } from "./slackService"

const API_BASE_URL = "/api"

/**
 * Get a document from a collection
 * @param {string} collection - Collection name (parts, orders, sales, supply)
 * @param {string} docId - Document ID
 * @returns {Promise<Object>} - Document data
 */
export async function getDocument(collection, docId) {
  try {
    const response = await fetch(`${API_BASE_URL}/${collection}/${docId}`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || `Error fetching ${collection}/${docId}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching ${collection}/${docId}:`, error)
    throw error
  }
}

/**
 * Create or overwrite a document
 * @param {string} collection - Collection name (parts, orders, sales, supply)
 * @param {string} docId - Document ID
 * @param {Object} data - Document data
 * @returns {Promise<Object>} - Response message
 */
export async function createOrUpdateDocument(collection, docId, data) {
  try {
    const response = await fetch(`${API_BASE_URL}/${collection}/${docId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || `Error creating/updating ${collection}/${docId}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error creating/updating ${collection}/${docId}:`, error)
    throw error
  }
}

/**
 * Update specific fields in a document
 * @param {string} collection - Collection name (parts, orders, sales, supply)
 * @param {string} docId - Document ID
 * @param {Object} data - Fields to update
 * @returns {Promise<Object>} - Response message
 */
export async function updateDocumentFields(collection, docId, data) {
  try {
    const response = await fetch(`${API_BASE_URL}/${collection}/${docId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || `Error updating fields in ${collection}/${docId}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error updating fields in ${collection}/${docId}:`, error)
    throw error
  }
}

/**
 * Delete a document
 * @param {string} collection - Collection name (parts, orders, sales, supply)
 * @param {string} docId - Document ID
 * @returns {Promise<Object>} - Response message
 */
export async function deleteDocument(collection, docId) {
  try {
    const response = await fetch(`${API_BASE_URL}/${collection}/${docId}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || `Error deleting ${collection}/${docId}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error deleting ${collection}/${docId}:`, error)
    throw error
  }
}

/**
 * Ask Hugo a question
 * @param {string} query — what the user typed
 * @returns {Promise<string>} — Hugo's reply text
 */
export async function chatWithHugo(query) {
  const res = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.description || err.detail || `Chat error: ${res.status}`)
  }
  const { response } = await res.json()
  return response
}

/**
 * Check for parts updates with Hugo AI
 * @param {boolean} sendToSlack - Whether to send the update to Slack
 * @returns {Promise<string>} - Hugo's response about parts status
 */
export async function checkPartsUpdateWithHugo(sendToSlack = true) {
  try {
    // Send query to Hugo AI
    const response = await chatWithHugo("update user on parts")

    // Save the response to localStorage so the notifications page can access it
    localStorage.setItem(
      "partsUpdate",
      JSON.stringify({
        message: response,
        timestamp: new Date().toISOString(),
      }),
    )

    // Send to Slack if requested
    if (sendToSlack) {
      try {
        const formattedMessage = formatSlackInventoryAlert(response)
        await sendSlackMessage(formattedMessage)
        console.log("Parts update sent to Slack")
      } catch (slackError) {
        console.error("Failed to send message to Slack:", slackError)
        // We don't want to fail the whole operation if just Slack fails
      }
    }

    return response
  } catch (error) {
    console.error("Error checking parts update with Hugo:", error)
    throw error
  }
}
