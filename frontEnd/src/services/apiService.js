/**
 * Service for interacting with the Firebase CRUD API
 */

const API_BASE_URL = "http://localhost:8000/api" // Update with your actual API URL

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
