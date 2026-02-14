import random

def generate_headline(content, category):
    """
    Generates a dramatic, clickbait-style headline based on the content and category.
    This is a mock implementation that uses heuristics and templates.
    In a real-world scenario, this would call an LLM API (OpenAI, etc.).
    """
    
    # Templates based on category
    templates = {
        "roast": [
            "You Won't Believe What This Person Just Said! 💀",
            "Emotional Damage Detected: {preview}...",
            "shots Fired! Is This The End Of Their Friendship?",
            "The Roast That Ended It All...",
        ],
        "confession": [
            "Secret Revealed: {preview}...",
            "Anonymous Source Spills The Tea ☕",
            "Shocking Confession: I Never Thought I'd Say This...",
            "The Truth Comes Out: {preview}",
        ],
        "meme": [
            "This Meme Just Broke The Internet 🤣",
            "Relatable Level: 1000",
            "If This Isn't Me, I Don't Know What Is",
            "Tag Yourself: {preview}",
        ],
        "joke": [
            "Comedy Gold Or Dad Joke? You Decide.",
            "Try Not To Laugh Challenge (Impossible)",
            "The Punchline We Didn't See Coming...",
        ],
        "news_bite": [
            "BREAKING: {preview}...",
            "Update: Requirements Just Changed Again?",
            "Hackathon Alert: {preview}",
        ],
        "casual": [
            "Vibe Check: {preview}...",
            "Just In: Someone Actually Touched Grass",
            "POV: {preview}",
        ]
    }
    
    # clean content for preview
    preview = content[:20].strip() + "..." if len(content) > 20 else content
    
    # Select template
    category_templates = templates.get(category, templates["casual"])
    template = random.choice(category_templates)
    
    # Generate headline
    headline = template.format(preview=preview)
    
    return headline
