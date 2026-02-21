

from google.adk import Agent
from google.adk.tools import FunctionTool
from app.agents.tools import get_day_activity
from app.agents.adk_utils import get_model, run_adk_agent
import json

# Define the Tool
activity_tool = FunctionTool(func=get_day_activity)

# Define the Agent
def get_activity_agent():
    return Agent(
        name="activity_agent",
        model=get_model(),
        tools=[activity_tool],
        instruction="""
        You are an enthusiastic Fitness Coach. 
        Your goal is to review workout data and provide brief, encouraging, but critical feedback.
        Highlight PRs or good volume if visible.
        """
    )

async def review_activity(user_id: str, date: str) -> str:
    """
    Agent: Activity Reviewer
    Objective: Review the user's activity for the day and provide feedback.
    """
    
    # We can rely on the Agent to call the tool, or fetch data manually and pass to prompt.
    # To demonstrate ADK capabilities, let's pass the data in the prompt for simplicity and reliability 
    # (avoiding multi-turn tool calling latency for this simple task), 
    # BUT since I defined the tool, let's try to use it if appropriate.
    # However, for a "Review" task where data is known context, passing it is cheaper/faster.
    # The previous implementation fetched data manually. 
    # Let's stick to the previous pattern of fetching data first (RAG-like) then prompting,
    # but use the ADK Agent structure for the generation.
    
    # 1. Fetch Data (Manual Tool Call for efficiency)
    workouts = await get_day_activity(user_id, date)
    
    if not workouts:
        return "You didn't log any workouts today. Rest day? If not, get moving!"
        
    instruction = "You are an enthusiastic Fitness Coach. Review workout data and provide a brief, encouraging, but critical summary of the performance. Highlight PRs or good volume if visible. If cardio was done, mention it. Keep it under 3 sentences."
    
    prompt = f"""
    Review the following workout data for today ({date}):
    
    {json.dumps(workouts, indent=2)}
    """
    
    # We use a simple agent instance for this generation
    agent = Agent(
        name="activity_summarizer", 
        model=get_model(),
        instruction=instruction,
        description="Agent that summarizes daily workout activities."
    )
    return await run_adk_agent(agent, prompt, user_id)

