
from google.adk import Agent
from google.genai import types
from app.agents.tools import get_day_diet, get_db_food_item
from app.agents.adk_utils import get_model, run_adk_agent, clean_json_response
import json

async def review_diet(user_id: str, date: str) -> str:
    """
    Agent: Calorie Reviewer
    Objective: Review caloric intake vs goal.
    """
    
    # 1. Fetch Data
    meals = await get_day_diet(user_id, date)
    
    if not meals:
        return "No meals logged today. Don't forget to track!"
        
    # Calculate totals
    total_cals = sum(m['total_calories'] for m in meals)
    total_protein = sum(m['total_protein'] for m in meals)
    
    instruction = "You are a Nutritionist. Provide specific feedback on food choices and macro balance. Keep it concise."
    
    prompt = f"""
    Review the user's diet for today ({date}).
    
    Total Calories: {total_cals}
    Total Protein: {total_protein}g
    
    Meals:
    {json.dumps(meals, indent=2)}
    """
    
    try:
        agent = Agent(
            name="diet_reviewer", 
            model=get_model(),
            instruction=instruction,
            description="Agent that reviews daily caloric intake vs goal."
        )
        return await run_adk_agent(agent, prompt, user_id)
    except Exception as e:
        return "Good logging today! (AI Review unavailable)"

async def search_and_retrieve_food(query: str) -> dict:
    """
    Agent: Calorie Retriever (Lazy RAG)
    Objective: Find macros for a food item. 
    Logic: 
    1. Check DB. 
    2. If missing, search Web (simulated/Gemini knowledge).
    """
    
    # 1. DB Lookup
    db_item = await get_db_food_item(query)
    if db_item:
        db_item["source"] = "database"
        return db_item
        
    # 2. AI Retrieval (Fallback)
    # We ask Gemini to estimate/retrieve the macros effectively acting as the search.
    
    instruction = """
    You are a Nutrition Assistant. 
    Return the nutritional info for "1 serving of the requested food" in JSON format.
    Fields MUST be exactly: name (str), calories (int), protein (float), carbs (float), fats (float).
    Return ONLY valid JSON without markdown wrapping.
    """
    
    prompt = f"Food item: {query}"
    
    try:
        # Configure Agent for JSON output by instruction since generate_content_config was removed from Agent kwargs
        agent = Agent(
            name="diet_retriever",
            model=get_model(),
            instruction=instruction,
            description="Find macros for a food item and return JSON."
        )
        
        response_text = await run_adk_agent(agent, prompt)
        
        # Parse JSON
        data = json.loads(clean_json_response(response_text))
        data["source"] = "ai_retrieval"
        return data # We do not save automatically here, UI should confirm first.
    except Exception as e:
        return {"error": "Could not retrieve food info", "details": str(e)}
