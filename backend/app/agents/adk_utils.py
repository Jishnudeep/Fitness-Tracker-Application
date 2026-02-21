
import sys
import os
import logging
import uuid
from google.adk import Agent
from google.adk.models import Gemini
from google.adk.tools import FunctionTool
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

logger = logging.getLogger(__name__)

# Initialize Model
# We reuse the same model instance typically
_model = "gemini-2.5-flash-lite"

def get_model():
    global _model
    api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    if not api_key:
        logger.error("GOOGLE_API_KEY or GEMINI_API_KEY not set in environment or .env file.")
    else:
        if not os.getenv("GOOGLE_API_KEY"):
           os.environ["GOOGLE_API_KEY"] = api_key
           
    return _model

async def create_session(agent: Agent, user_id: str, session_id: str): 
    try:
        session_service = InMemorySessionService()
        runner = Runner(
            agent = agent,
            app_name = "TheCutRouteApp",
            session_service = session_service
        )
        
        session = await session_service.create_session(
            app_name="TheCutRouteApp",
            user_id=user_id, 
            session_id=session_id
        )

        return runner, session
    except Exception as e:
        logger.error(f"Error creating session: {e}")
        return None

async def run_adk_agent(agent: Agent, prompt: str, user_id: str = "default_user") -> str:
    """
    Runs an ADK Agent with a given prompt and returns the text response.
    Handles the async event stream from ADK.
    """
    session_id = str(uuid.uuid4())
    # Create the message content
    message = types.Content(
        role="user",
        parts=[types.Part(text=prompt)]
    )

    runner, session = await create_session(agent, user_id, session_id)
    
    response_text = ""
    
    try:
        # Run the agent using simpler string message
        for event in runner.run(
            session_id=session_id,
            new_message=message,
            user_id=user_id
        ):
            # Inspect event structure based on ADK patterns
            if event.content and event.content.parts:
                for part in event.content.parts:
                    if part.text:
                        response_text += part.text
        
        print(response_text)
        
    except Exception as e:
        logger.error(f"Error running ADK agent: {e}", exc_info=True)
        return f"Error running agent: {str(e)}"
        
    logger.info(f"ADK Agent Raw Response: {response_text[:500]}..." if len(response_text) > 500 else f"ADK Agent Raw Response: {response_text}")
    return response_text.strip()

def clean_json_response(response_text: str) -> str:
    """
    Cleans markdown formatting from JSON response.
    Removes ```json and ``` delimiters.
    """
    cleaned = response_text.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]
    
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
        
    return cleaned.strip()
