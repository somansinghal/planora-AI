"""
Planora AI – AI Service

Provides AI-powered event plan generation using Groq (primary provider).
Implements:
- Structured output with Pydantic validation
- Timeout handling
- Rate limiting per user
- Error handling and fallback messages
- Safe prompt construction
"""

import asyncio
import json
import logging
import time
from typing import Optional, Dict, Any, List
from collections import defaultdict

from app.core.config import settings

logger = logging.getLogger(__name__)

# ── Simple in-memory rate limiter ────────────────────────────
# For production, use Redis or a database-backed rate limiter.
_rate_limit_store: Dict[str, List[float]] = defaultdict(list)


def check_rate_limit(user_id: str, limit_per_hour: int = None) -> bool:
    """
    Returns True if the user is within rate limits.
    Returns False if rate limit exceeded.
    """
    if limit_per_hour is None:
        limit_per_hour = settings.AI_REQUESTS_PER_USER_PER_HOUR

    now = time.time()
    window_start = now - 3600  # 1 hour window

    # Clean old entries
    _rate_limit_store[user_id] = [
        t for t in _rate_limit_store[user_id] if t > window_start
    ]

    if len(_rate_limit_store[user_id]) >= limit_per_hour:
        return False

    _rate_limit_store[user_id].append(now)
    return True


def get_remaining_quota(user_id: str) -> int:
    """Returns remaining AI requests for the user in the current hour."""
    now = time.time()
    window_start = now - 3600
    recent_requests = [
        t for t in _rate_limit_store.get(user_id, []) if t > window_start
    ]
    return max(0, settings.AI_REQUESTS_PER_USER_PER_HOUR - len(recent_requests))


# ── Groq Client ───────────────────────────────────────────────
_groq_client = None


def _get_groq_client():
    """Initialize Groq client lazily."""
    global _groq_client
    if _groq_client is not None:
        return _groq_client

    if not settings.GROQ_API_KEY:
        logger.warning("GROQ_API_KEY not configured. AI features will be unavailable.")
        return None

    try:
        from groq import Groq
        _groq_client = Groq(api_key=settings.GROQ_API_KEY)
        logger.info(f"Groq client initialized (model: {settings.AI_MODEL})")
        return _groq_client
    except ImportError:
        logger.error("groq package not installed. Run: pip install groq")
        return None
    except Exception as e:
        logger.error(f"Groq client initialization failed: {e}")
        return None


# ── Event Plan Generation ─────────────────────────────────────

def build_event_plan_prompt(event_data: dict, preferences: dict = None) -> str:
    """
    Build a structured prompt for AI event plan generation.
    
    Carefully constructed to prevent prompt injection while
    incorporating user-provided data safely.
    """
    # Extract and sanitize event data
    event_name = str(event_data.get('name', 'Event'))[:200]
    event_type = str(event_data.get('event_type', 'other'))
    event_date = str(event_data.get('event_date', 'TBD'))
    location = str(event_data.get('location', 'TBD'))[:300]
    guest_count = int(event_data.get('guest_count', 50))
    budget = float(event_data.get('budget', 100000))
    currency = str(event_data.get('currency', 'INR'))
    theme = str(event_data.get('theme', ''))[:200]
    dietary = str(event_data.get('dietary_preferences', ''))[:200]
    requirements = str(event_data.get('additional_requirements', ''))[:500]

    # Preferences
    prefs = preferences or {}
    preferred_themes = str(prefs.get('preferred_themes', ''))[:200]
    budget_priority = str(prefs.get('budget_priority', 'balanced'))[:100]
    additional_prefs = str(prefs.get('additional_preferences', ''))[:500]

    prompt = f"""You are an expert event planner with 20 years of experience planning events in India and internationally.

Create a comprehensive, detailed event plan for the following event:

EVENT DETAILS:
- Event Name: {event_name}
- Event Type: {event_type}
- Date: {event_date}
- Location: {location}
- Guest Count: {guest_count} guests
- Total Budget: {currency} {budget:,.0f}
- Theme: {theme or 'Open to suggestions'}
- Dietary Preferences: {dietary or 'Standard mix'}
- Additional Requirements: {requirements or 'None specified'}
- Budget Priority: {budget_priority}
- Additional Preferences: {additional_prefs or 'None'}

CRITICAL REQUIREMENTS:
1. All budget allocations MUST sum to exactly 100%
2. All estimated costs MUST be in {currency} and must NOT exceed the total budget of {budget:,.0f}
3. Provide realistic, market-appropriate cost estimates for {location or 'India'}
4. Clearly label all costs as ESTIMATED only
5. Do NOT suggest any illegal activities
6. Be culturally appropriate and sensitive

Return a JSON response with EXACTLY this structure (no extra text, just valid JSON):
{{
    "event_summary": "2-3 sentence overview of the event concept",
    "theme_ideas": ["theme1", "theme2", "theme3", "theme4", "theme5"],
    "budget_breakdown": [
        {{"category": "Venue", "estimated_amount": 0, "percentage": 0, "notes": "string"}},
        {{"category": "Catering", "estimated_amount": 0, "percentage": 0, "notes": "string"}},
        {{"category": "Decoration", "estimated_amount": 0, "percentage": 0, "notes": "string"}},
        {{"category": "Photography/Videography", "estimated_amount": 0, "percentage": 0, "notes": "string"}},
        {{"category": "Entertainment", "estimated_amount": 0, "percentage": 0, "notes": "string"}},
        {{"category": "Invitations & Stationery", "estimated_amount": 0, "percentage": 0, "notes": "string"}},
        {{"category": "Transportation", "estimated_amount": 0, "percentage": 0, "notes": "string"}},
        {{"category": "Miscellaneous", "estimated_amount": 0, "percentage": 0, "notes": "string"}}
    ],
    "timeline_milestones": [
        {{"days_before": 180, "title": "string", "description": "string", "priority": "high"}},
        {{"days_before": 90, "title": "string", "description": "string", "priority": "high"}},
        {{"days_before": 60, "title": "string", "description": "string", "priority": "medium"}},
        {{"days_before": 30, "title": "string", "description": "string", "priority": "high"}},
        {{"days_before": 14, "title": "string", "description": "string", "priority": "high"}},
        {{"days_before": 7, "title": "string", "description": "string", "priority": "high"}},
        {{"days_before": 1, "title": "string", "description": "string", "priority": "high"}},
        {{"days_before": 0, "title": "Event Day", "description": "string", "priority": "high"}}
    ],
    "event_day_schedule": [
        {{"time": "09:00", "activity": "string", "duration_minutes": 60, "notes": "string"}},
        {{"time": "10:00", "activity": "string", "duration_minutes": 60, "notes": "string"}}
    ],
    "vendor_checklist": [
        {{"category": "string", "description": "string", "estimated_cost_min": 0, "estimated_cost_max": 0, "tips": "string"}}
    ],
    "task_suggestions": ["task1", "task2", "task3"],
    "personalized_recommendations": ["rec1", "rec2", "rec3"],
    "cost_saving_suggestions": ["saving1", "saving2", "saving3"]
}}

Make the plan specific to a {event_type} event with {guest_count} guests and a {currency} {budget:,.0f} budget.
Be detailed, practical, and culturally relevant."""

    return prompt


async def generate_event_plan(event_data: dict, preferences: dict = None) -> dict:
    """
    Generate an AI-powered event plan.
    
    Returns:
        dict with 'success', 'plan' (dict), and 'error' (str) keys.
    """
    client = _get_groq_client()

    if client is None:
        return {
            "success": False,
            "plan": None,
            "error": "AI service is not configured. Please contact support.",
        }

    prompt = build_event_plan_prompt(event_data, preferences)

    try:
        logger.info(f"Generating event plan for event type: {event_data.get('event_type')}")

        # Run synchronous Groq client in thread pool
        loop = asyncio.get_event_loop()
        response = await asyncio.wait_for(
            loop.run_in_executor(
                None,
                lambda: client.chat.completions.create(
                    model=settings.AI_MODEL,
                    messages=[
                        {
                            "role": "system",
                            "content": "You are an expert event planner. Always respond with valid JSON only. Never include markdown code blocks or extra text."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    temperature=settings.AI_TEMPERATURE,
                    max_tokens=settings.AI_MAX_TOKENS,
                    response_format={"type": "json_object"},
                )
            ),
            timeout=settings.AI_REQUEST_TIMEOUT,
        )

        raw_content = response.choices[0].message.content
        
        # Parse JSON
        try:
            plan_data = json.loads(raw_content)
        except json.JSONDecodeError as e:
            logger.error(f"AI response JSON parse error: {e}")
            logger.debug(f"Raw AI response (first 500 chars): {raw_content[:500]}")
            return {
                "success": False,
                "plan": None,
                "error": "AI generated an invalid response. Please try again.",
            }

        # Validate with Pydantic schema
        from app.schemas import EventPlanResponse
        try:
            validated_plan = EventPlanResponse(
                event_id=event_data.get('id', ''),
                ai_provider=settings.AI_PROVIDER,
                ai_model=settings.AI_MODEL,
                **plan_data
            )
            return {
                "success": True,
                "plan": validated_plan.model_dump(),
                "error": None,
            }
        except Exception as validation_err:
            logger.warning(f"AI plan validation error: {validation_err}")
            # Return raw plan with disclaimer
            plan_data['event_id'] = event_data.get('id', '')
            plan_data['ai_provider'] = settings.AI_PROVIDER
            plan_data['ai_model'] = settings.AI_MODEL
            plan_data['disclaimer'] = "These are AI-generated suggestions. Costs are estimates only. Verify all vendor availability and pricing independently."
            return {
                "success": True,
                "plan": plan_data,
                "error": None,
                "validation_warning": str(validation_err),
            }

    except asyncio.TimeoutError:
        logger.warning(f"AI request timed out after {settings.AI_REQUEST_TIMEOUT}s")
        return {
            "success": False,
            "plan": None,
            "error": f"AI request timed out. The service may be busy — please try again in a moment.",
        }
    except Exception as exc:
        logger.error(f"AI generation error: {type(exc).__name__}: {exc}")
        return {
            "success": False,
            "plan": None,
            "error": "AI generation failed. Please try again later.",
        }


# ── AI Copilot ────────────────────────────────────────────────

async def chat_with_copilot(
    user_message: str,
    event_context: dict,
    history: List[dict] = None,
) -> dict:
    """
    Handle AI Copilot chat for event refinement.
    
    Returns dict with 'message', 'suggestions', and 'event_changes'.
    """
    client = _get_groq_client()

    if client is None:
        return {
            "message": "AI Copilot is not available. Please configure the AI service.",
            "suggestions": [],
            "event_changes": None,
            "requires_confirmation": False,
        }

    # Build context-aware system prompt
    system_prompt = f"""You are Planora AI Copilot, an expert event planning assistant.

Current event context:
- Event: {event_context.get('name', 'Unknown')}
- Type: {event_context.get('event_type', 'Unknown')}
- Date: {event_context.get('event_date', 'TBD')}
- Budget: {event_context.get('currency', 'INR')} {event_context.get('budget', 0):,.0f}
- Guests: {event_context.get('guest_count', 0)}
- Location: {event_context.get('location', 'TBD')}

You help users refine their event plans. You can:
1. Suggest budget optimizations
2. Recommend theme alternatives
3. Help reorganize timelines
4. Suggest vendors or catering options
5. Identify planning gaps

IMPORTANT:
- All cost suggestions must be in {event_context.get('currency', 'INR')} and realistic for the market
- Clearly label suggestions as estimates only
- Never guarantee vendor availability or prices
- If suggesting changes to the event plan, ask for user confirmation first
- Be friendly, helpful, and concise

Respond in JSON format:
{{
    "message": "Your helpful response here",
    "suggestions": ["suggestion1", "suggestion2"],
    "event_changes": null,
    "requires_confirmation": false
}}"""

    messages = [{"role": "system", "content": system_prompt}]
    
    # Add conversation history (max 10 messages for token efficiency)
    if history:
        for msg in history[-10:]:
            if msg.get('role') in ('user', 'assistant') and msg.get('content'):
                messages.append({
                    "role": msg['role'],
                    "content": str(msg['content'])[:1000]  # Limit history message size
                })

    messages.append({"role": "user", "content": user_message})

    try:
        loop = asyncio.get_event_loop()
        response = await asyncio.wait_for(
            loop.run_in_executor(
                None,
                lambda: client.chat.completions.create(
                    model=settings.AI_MODEL,
                    messages=messages,
                    temperature=0.8,
                    max_tokens=1000,
                    response_format={"type": "json_object"},
                )
            ),
            timeout=settings.AI_REQUEST_TIMEOUT,
        )

        raw = response.choices[0].message.content
        try:
            result = json.loads(raw)
            return {
                "message": str(result.get("message", ""))[:2000],
                "suggestions": [str(s)[:200] for s in result.get("suggestions", [])[:5]],
                "event_changes": result.get("event_changes"),
                "requires_confirmation": bool(result.get("requires_confirmation", False)),
            }
        except json.JSONDecodeError:
            return {
                "message": raw[:1000] if raw else "I encountered an error. Please try again.",
                "suggestions": [],
                "event_changes": None,
                "requires_confirmation": False,
            }

    except asyncio.TimeoutError:
        return {
            "message": "I'm taking longer than expected. Please try your request again.",
            "suggestions": [],
            "event_changes": None,
            "requires_confirmation": False,
        }
    except Exception as exc:
        logger.error(f"Copilot error: {type(exc).__name__}")
        return {
            "message": "I encountered an error. Please try again in a moment.",
            "suggestions": [],
            "event_changes": None,
            "requires_confirmation": False,
        }
