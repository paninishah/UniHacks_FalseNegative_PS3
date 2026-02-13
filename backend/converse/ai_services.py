
import os
import logging
import google.generativeai as genai
from django.conf import settings

# Configure logger
logger = logging.getLogger(__name__)

def generate_dramatic_headline(event_text):
    """
    Generates a short, sarcastic, witty, and funny dramatic headline from user input using Gemini API.
    
    Args:
        event_text (str): The event description to convert.
        
    Returns:
        str: The generated headline or an error message.
    """
    # 1. API Setup: Fetch key from environment (priority) or settings (fallback)
    api_key = os.environ.get("GEMINI_API_KEY")
    
    if not api_key:
        # Check if Django settings are configured before accessing them
        if settings.configured:
            api_key = getattr(settings, "GEMINI_API_KEY", None)
    
    if not api_key:
        logger.error("GEMINI_API_KEY is missing. Please set it in .env or settings.py")
        return "Error: Identity Crisis (Missing API Key)"

    try:
        # 2. Configure Gemini
        genai.configure(api_key=api_key)
        
        # Using 'gemini-1.5-flash' for speed and efficiency (Free Tier compatible)
        # Fallback to 'gemini-pro' if flash is unavailable
        model = genai.GenerativeModel('gemini-1.5-flash')

        # 3. Construct the Prompt
        # Strict instructions for tone and format
        prompt = f"""
        Act as a witty, sarcastic sitcom narrator.
        Convert the following event into a dramatic headline.

        Rules:
        - Tone: Dry sarcasm, intelligent humor, slight exaggeration.
        - Narrative Style: Sitcom episode title or news chyron.
        - Length: Strictly 8 to 12 words.
        - Constraints: NO emojis, NO slang, NO quotes, NO hashtags.
        - Content: Do NOT explain the joke. Do NOT use childish humor.
        - Output: ONLY the headline text.

        Event: {event_text}
        Headline:
        """

        # 4. Generate Content
        response = model.generate_content(prompt)
        
        if response.text:
            # Clean up the response (remove potential quotes or newlines)
            cleaned_headline = response.text.strip().replace('"', '').replace("'", "")
            return cleaned_headline
        else:
            return "Error: The Writers Are on Strike (No Response)"

    except Exception as e:
        logger.error(f"Error generating headline: {e}")
        # Return a fallback "dramatic" error message
        return "Error: Technical Difficulties in the Simulation"

# ==========================================
# Example Usage (Run this file directly)
# ==========================================
if __name__ == "__main__":
    # Mock settings for standalone execution if needed
    if not os.environ.get("DJANGO_SETTINGS_MODULE"):
        import sys
        # Add project root to path to find settings if needed, 
        # but here we rely on os.environ for the key in direct run.
        pass

    # TEST CASE
    print("--- AI Headline Generator Test ---")
    
    # You must set GEMINI_API_KEY in your terminal before running:
    # export GEMINI_API_KEY="your_key_here"
    
    test_event = "Rahul slept during an important lecture"
    print(f"Event: {test_event}")
    
    # Check if key is present for the test
    if not os.environ.get("GEMINI_API_KEY"):
        print("⚠️  WARNING: GEMINI_API_KEY not found in environment. Test might fail.")
    
    headline = generate_dramatic_headline(test_event)
    print(f"Headline: {headline}")
