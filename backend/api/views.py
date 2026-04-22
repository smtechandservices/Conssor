import os
import json
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from groq import Groq
from .models import Client, Engagement, EngagementQuote

def generate_pricing_prompt(data):
    return f"""
You are CONSSOR's engagement pricing specialist. Analyze this consulting engagement request and provide a pricing recommendation.

INPUT DATA:
- Industry: {', '.join(data.get('domain_tags', []))}
- Services: {', '.join(data.get('engagement_scope', []))}
- Project Stage: {data.get('project_stage')}
- Engagement Type: {data.get('engagement_type')}
- Client Budget Range: {data.get('budget_range')}
- Country: {data.get('country')}
- Description: "{data.get('description')}"

PRICING FACTORS:
1. Industry complexity (Financial Services, Healthcare = premium; Retail, Agriculture = standard)
2. Multi-scope engagements (2+ services) = +30% base
3. Project stage: Ideation (1x), Growth (1.5x), M&A/Transaction (2.5x)
4. Retainer vs One-time: Retainer = sustained delivery pricing
5. Geographic cost adjustment: India/Turkey = 0.7x, US/Europe = 1.0x

OUTPUT REQUIRED (respond ONLY with valid JSON, no markdown):
{{
  "recommended_price_usd": <number>,
  "price_range_low": <number>,
  "price_range_high": <number>,
  "pricing_rationale": "<2-3 sentence explanation>",
  "estimated_duration_weeks": <number>,
  "confidence_score": <0.0-1.0>
}}
"""

@api_view(['POST'])
@permission_classes([AllowAny])
def generate_quote(request):
    data = request.data
    
    # 1. Create the Client stub
    client = Client.objects.create(
        organization_name=data.get('organizationName', 'Unknown'),
        contact_name=data.get('fullName', 'Unknown'),
        email=data.get('email', f"temp_{timezone.now().timestamp()}@example.com"),
        phone=data.get('phone', ''),
        country=data.get('country', ''),
        domain_tags=data.get('domain_tags', []),
        engagement_scope=data.get('engagement_scope', []),
        project_stage=data.get('project_stage', ''),
        budget_range=data.get('budget_range', ''),
        engagement_type=data.get('engagement_type', 'one_time')
    )
    
    # 2. Create Engagement stub (wait for consultant assignment)
    engagement = Engagement.objects.create(
        client=client,
        consultant_id=None, # System will assign later
        scope=data.get('engagement_scope', []),
        stage=data.get('project_stage', ''),
        status='active',
        start_date=timezone.now().date()
    )

    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        return Response({"error": "GROQ_API_KEY not configured on server."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    try:
        groq_client = Groq(api_key=api_key)
        completion = groq_client.chat.completions.create(
            model="llama3-70b-8192", # Using robust standard model for JSON
            messages=[{"role": "user", "content": generate_pricing_prompt(data)}],
            temperature=0.3,
            max_tokens=2048,
            response_format={"type": "json_object"}
        )
        pricing = json.loads(completion.choices[0].message.content)
        
        # 3. Save Quote
        quote = EngagementQuote.objects.create(
            engagement=engagement,
            ai_recommended_price=pricing.get('recommended_price_usd', 0),
            ai_price_range_low=pricing.get('price_range_low', 0),
            ai_price_range_high=pricing.get('price_range_high', 0),
            ai_rationale=pricing.get('pricing_rationale', ''),
            ai_confidence_score=pricing.get('confidence_score', 0.5),
            ai_estimated_weeks=pricing.get('estimated_duration_weeks', 4),
            final_price=pricing.get('recommended_price_usd', 0), # Admin can override later
            status='pending_admin'
        )
        
        return Response({
            "message": "Quote generated successfully.",
            "quote_id": quote.id,
            "ai_rationale": quote.ai_rationale,
            "ai_estimated_weeks": quote.ai_estimated_weeks,
            "final_price": quote.final_price
        })

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
