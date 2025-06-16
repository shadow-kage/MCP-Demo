from flask import Flask, render_template, request, jsonify
import os
import asyncio
import logging
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from mcp_use import MCPAgent, MCPClient
import nest_asyncio

nest_asyncio.apply()
load_dotenv()

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

os.environ["GROQ_API_KEY"] = os.getenv("GROQ_API_KEY")

# Load your MCP config file that includes tools from weather.py and/or calc.py
client = MCPClient.from_config_file("calc.json")  # or "calc.json" if both are merged

# Initialize ChatGroq model
llm = ChatGroq(model="llama3-8b-8192", temperature=1)

# Setup MCP agent
agent = MCPAgent(llm=llm, client=client, max_steps=15, memory_enabled=True)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    user_input = request.json.get("message")

    if user_input.lower() in ["exit", "quit"]:
        return jsonify({"response": "Session ended."})
    elif user_input.lower() == "clear":
        agent.clear_conversation_history()
        return jsonify({"response": "Conversation history cleared."})

    async def run_query():
        try:
            logging.info(f"📨 User: {user_input}")
            return await agent.run(user_input)
        except asyncio.TimeoutError:
            return "⏱️ Response timed out."
        except Exception as e:
            logging.error(f"Agent error: {e}")
            return f"⚠️ {str(e)}"

    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        response = loop.run_until_complete(run_query())
        return jsonify({"response": response})
    except Exception as e:
        return jsonify({"response": f"⚠️ Unexpected Error: {str(e)}"})

if __name__ == "__main__":
    app.run(debug=True)
