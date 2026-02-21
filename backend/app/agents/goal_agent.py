
from app.schemas.goal import GoalCreate
from google.adk import Agent
from google.genai import types
from app.agents.adk_utils import get_model, run_adk_agent, clean_json_response
import json

async def analyze_goal(goal: GoalCreate) -> dict:
    """
    Uses Gemini (via ADK Agent) to analyze the user's stats and goal.
    Returns a dictionary with advised deficits and analysis.
    """
    
    # 1. Construct Prompt
    instruction = """
    You are 'TheCutRoute' AI Coach, an elite level fitness and nutrition strategist. 
    Your goal is to provide a highly professional, encouraging, and science-based analysis of the user's stats and goals.
    
    ### FORMATTING RULES:
    - Use Markdown for the "analysis" field.
    - Use H3 (###) for section headers.
    - Use Bullet points for readability.
    - **Bold** key metrics.
    - DO NOT include a title like "Fitness Plan Analysis" at the top; start directly with the analysis.
    - Keep the tone elite, direct, and motivating.
    
    Return the response in JSON format with strictly these keys:
    - "daily_caloric_deficit": (int) recommended deficit
    - "daily_calories": (int) recommended total daily intake
    - "analysis": (string) The formatted markdown content.
    Return ONLY valid JSON.
    """
    
    prompt = f"""
    ### USER PROFILE:
    - Height: {goal.current_height} cm
    - Current Weight: {goal.current_weight} kg
    - Age: {goal.age} years
    - Body Fat: {goal.current_body_fat}%
    
    ### TARGETS:
    - Goal Weight: {goal.goal_weight} kg
    - Goal Body Fat: {goal.goal_body_fat}%
    - Target Date: {goal.target_date}
    
    ### YOUR TASK:
    1. **Metabolic Analysis**: Calculate BMR and TDEE (Sedentary baseline).
    2. **Strategic Plan**: Determine a sustainable caloric deficit to reach the goal by {goal.target_date}.
    3. **Professional Advice**: Provide specific advice on protein intake, training focus, and mindset.
    """
    
    try:
        # Configure ADK Agent with JSON instruction
        agent = Agent(
            name="goal_analyzer",
            model=get_model(),
            instruction=instruction,
            description="Agent that analyzes user health targets to produce a customized fitness plan."
        )
        
        response_text = await run_adk_agent(agent, prompt)
        
        result = json.loads(clean_json_response(response_text))
        return result
        
    except Exception as e:
        # Fallback or Error
        return {
            "daily_caloric_deficit": 500,
            "daily_calories": 2000,
            "analysis": f"AI Analysis failed: {str(e)}. Defaulting to standard 500kcal deficit." 
        }
