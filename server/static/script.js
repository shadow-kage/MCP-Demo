const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");
const toggleDark = document.getElementById("toggle-dark");
const toggleHistory = document.getElementById("toggle-history");
const chatHistory = document.getElementById("chat-history");
const spinner = document.getElementById("spinner");

let isWaiting = false;

async function typeWriter(text, element, delay = 20) {
    for (let i = 0; i < text.length; i++) {
        element.innerHTML += text.charAt(i);
        await new Promise(resolve => setTimeout(resolve, delay));
    }
}

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message || isWaiting) return;

    isWaiting = true;
    sendBtn.disabled = true;
    userInput.disabled = true;
    spinner.classList.remove("hidden");

    // Show user message
    const userMsg = document.createElement("p");
    userMsg.textContent = `You: ${message}`;
    chatBox.appendChild(userMsg);
    chatBox.scrollTop = chatBox.scrollHeight;
    userInput.value = "";

    // Show "Assistant is typing..."
    const typingMsg = document.createElement("p");
    typingMsg.id = "typing-msg";
    typingMsg.textContent = "Assistant is typing...";
    chatBox.appendChild(typingMsg);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const response = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        typingMsg.remove();
        spinner.classList.add("hidden");

        const botMsg = document.createElement("p");
        botMsg.innerHTML = "<strong>Assistant:</strong> ";
        chatBox.appendChild(botMsg);
        await typeWriter(data.response, botMsg);
        chatBox.scrollTop = chatBox.scrollHeight;

        // Optional: Save to history
        const hist = document.createElement("p");
        hist.textContent = `You: ${message} -> Assistant: ${data.response}`;
        chatHistory.appendChild(hist);

    } catch (error) {
        typingMsg.remove();
        spinner.classList.add("hidden");

        const errorMsg = document.createElement("p");
        errorMsg.textContent = "Assistant: Error occurred.";
        chatBox.appendChild(errorMsg);
    }

    isWaiting = false;
    sendBtn.disabled = false;
    userInput.disabled = false;
    userInput.focus();
}

// Event listeners
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter" && !isWaiting) sendMessage();
});

toggleDark.addEventListener("click", () => {
    document.body.classList.toggle("dark");
});

toggleHistory.addEventListener("click", () => {
    chatHistory.classList.toggle("hidden");
});
