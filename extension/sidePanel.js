// Assigning variable names to the Id(s) to make HTML elements interactive.
const submitBtn = document.getElementById("submitBtn");
const apiKeyInput = document.getElementById("apiKey");
const statusElement = document.getElementById("keyStatus");

const authView = document.getElementById("authView");
const mainView = document.getElementById("mainView");

const askAiBtn = document.getElementById("askAiBtn");
const userQueryInput = document.getElementById("userQuery");
const responseContainer = document.getElementById("responseContainer");
const resetKeyBtn = document.getElementById("resetKeyBtn");

// 1. Check storage when panel opens
document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get(["apiKey"], (data) => {
    if (data.apiKey) {
      showMainView();
    } else {
      showAuthView();
    }
  });
});

// Switch Views
function showMainView() {
  authView.classList.add("hidden");
  mainView.classList.remove("hidden");
}

function showAuthView() {
  mainView.classList.add("hidden");
  authView.classList.remove("hidden");
}

// 2. API KEY Submit Button function

// Validates the Gemini API Key using function validateGeminiKey(<arg>)
// Returns whether the key exist and save it to Chrome Storage
submitBtn.onclick = async function(){
    const rawKey = apiKeyInput.value.trim();
    statusElement.textContent = "Validating key...";
    statusElement.style.color = "gray";

    const result = await validateGeminiKey(rawKey);

    if (result.valid) {
        // Key is valid: Save to storage
        chrome.storage.sync.set({ apiKey: rawKey }, () => {
            showMainView();
        });
    } else {
        // Key is invalid: Show failure message
        statusElement.textContent = "❌ " + result.message;
        statusElement.style.color = "red";
    }
};

// 3. Reset Key Handler
resetKeyBtn.onclick = function() {
  chrome.storage.sync.remove("apiKey", () => {
    apiKeyInput.value = "";
    showAuthView();
  });
};


// 4. Send Query to Gemini model
askAiBtn.onclick = async function () {
  const prompt = userQueryInput.value.trim();
  if (!prompt) return;

  responseContainer.textContent = "Thinking...";

  chrome.storage.sync.get(["apiKey"], async (data) => {
    if (!data.apiKey) {
      showAuthView();
      return;
    }

    try {
      const aiResponse = await fetchGeminiResponse(data.apiKey, prompt);
      responseContainer.textContent = aiResponse;
    } catch (err) {
      responseContainer.textContent = "Error: " + err.message;
    }
  });
};

// Automatically picks an active model from the user's API key
async function getBestAvailableModel(apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();

  if (!data.models) throw new Error("Could not fetch available models.");

  // Filter for generateContent models and prioritize flash versions
  const flashModel = data.models.find(m => 
    m.supportedGenerationMethods?.includes("generateContent") && 
    m.name.includes("flash")
  );

  // Return formatted name (e.g. "models/gemini-1.5-flash" -> "gemini-1.5-flash")
  return flashModel ? flashModel.name.replace("models/", "") : "gemini-1.5-flash";
}

async function fetchGeminiResponse(apiKey, prompt) {
  // Dynamically resolve model name
  const modelName = await getBestAvailableModel(apiKey);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  const data = await response.json();

  if (response.ok && data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
    return data.candidates[0].content.parts[0].text;
  } else {
    throw new Error(data.error?.message || "Failed to get response from Gemini.");
  }
}

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
