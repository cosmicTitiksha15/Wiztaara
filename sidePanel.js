const submitBtn = document.getElementById("submitBtn");
const apiKeyInput = document.getElementById("apiKey");
const statusElement = document.getElementById("keyStatus");

// API KEY Submit Button function
// Validates the Gemini API Key using function validateGeminiKey(<arg>)
// Returns whether the key exist and save it to Chrome Storage
submitBtn.onclick = async function(){
    const rawKey = apiKeyInput.value;
    statusElement.textContent = "Validating key...";
    statusElement.style.color = "gray";

    const result = await validateGeminiKey(rawKey);

    if (result.valid) {
        // Key is valid: Save to storage
        chrome.storage.sync.set({ apiKey: rawKey.trim() }, () => {
            statusElement.textContent = "✅ " + result.message;
            statusElement.style.color = "green";
        });
    } else {
        // Key is invalid: Show failure message
        statusElement.textContent = "❌ " + result.message;
        statusElement.style.color = "red";
    }
};


// Function that Validates Gemini API Key
async function validateGeminiKey(apiKey) {
    if (!apiKey || apiKey.trim() === "") {
        return { valid: false, message: "API Key cannot be empty." };
    }

    // Use the models endpoint to test the key without consuming prompt quota
    const testUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`;

    try {
        const response = await fetch(testUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
        });

        const data = await response.json();

        if (response.status === 200 && data.models) {
        return { valid: true, message: "API Key is valid!" };
        } else {
        // Return specific error message from Google's response
        const errorMsg = data.error?.message || "Invalid API key or unauthorized request.";
        return { valid: false, message: errorMsg };
        }
    } catch (error) {
        return { valid: false, message: "Network error. Please check your connection." };
    }
}
// Closure of function that Validates Gemini API Key
