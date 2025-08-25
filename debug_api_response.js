// Simple test to check what the API is returning
const API_BASE_URL = "http://localhost:8000/api";

async function testChatAPI() {
  console.log("Testing Chat API Response Structure...");

  const productId = 1;
  const sessionId = "test_session_123";

  try {
    // Test the new endpoint
    console.log("\n1. Testing new endpoint:");
    const newEndpoint = `${API_BASE_URL}/products/${productId}/chat/sessions/${sessionId}/messages`;
    console.log(`GET ${newEndpoint}`);

    const response = await fetch(newEndpoint);
    console.log("Status:", response.status);

    if (response.ok) {
      const data = await response.json();
      console.log("Response structure:", JSON.stringify(data, null, 2));
    } else {
      console.log("Error response:", await response.text());
    }

    // Test the old endpoint
    console.log("\n2. Testing old endpoint:");
    const oldEndpoint = `${API_BASE_URL}/products/${productId}/messages?session_id=${sessionId}`;
    console.log(`GET ${oldEndpoint}`);

    const response2 = await fetch(oldEndpoint);
    console.log("Status:", response2.status);

    if (response2.ok) {
      const data = await response2.json();
      console.log("Response structure:", JSON.stringify(data, null, 2));
    } else {
      console.log("Error response:", await response2.text());
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

// Run the test
testChatAPI();
