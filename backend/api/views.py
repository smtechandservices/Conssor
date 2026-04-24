import os
import json
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from groq import Groq
from .models import Client, Engagement, EngagementQuote, ClientPayment

def call_groq_api(messages, preferred_model, fallback_model, response_format=None, max_tokens=2048):
    """
    Helper to call Groq API with automatic fallback to a secondary model.
    """
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise Exception("GROQ_API_KEY not found in environment variables.")
    
    client = Groq(api_key=api_key)
    
    try:
        # Attempt primary model
        completion = client.chat.completions.create(
            model=preferred_model,
            messages=messages,
            temperature=0.3 if response_format else 0.7,
            max_tokens=max_tokens,
            response_format=response_format
        )
        return completion.choices[0].message.content
    except Exception as e:
        print(f"Groq Primary Model ({preferred_model}) Error: {str(e)}")
        print(f"Attempting fallback to {fallback_model}...")
        
        # Attempt fallback model
        completion = client.chat.completions.create(
            model=fallback_model,
            messages=messages,
            temperature=0.3 if response_format else 0.7,
            max_tokens=2048,
            response_format=response_format
        )
        return completion.choices[0].message.content

def generate_pricing_prompt(client, engagement_type=None):
    scope_count = len(client.engagement_scope) if client.engagement_scope else 0
    industries = ', '.join(client.domain_tags) if client.domain_tags else 'Not specified'
    services = ', '.join(client.engagement_scope) if client.engagement_scope else 'Not specified'

    return f"""
You are CONSSOR's engagement pricing specialist. Analyze this consulting engagement request and provide a precise pricing recommendation.

CLIENT PROFILE:
- Organisation: {client.organization_name or 'Individual'}
- Contact: {client.contact_name}
- Email: {client.email}
- Phone: {client.phone}
- Country: {client.country}

ENGAGEMENT DETAILS:
- Industry Verticals: {industries}
- Services Requested: {services} ({scope_count} service{'s' if scope_count != 1 else ''})
- Project Stage: {client.project_stage}
- Engagement Type: {engagement_type or 'Not specified'}
- Client Budget Range: {client.budget_range}
- Project Summary: "{client.project_summary or 'Not provided'}"

PRICING METHODOLOGY:
1. Industry complexity premium: Financial Services / Healthcare / M&A = 1.5–2.5x base; Tech / Energy = 1.2x; Retail / Agriculture = 1.0x
2. Multi-scope multiplier: 2 services = +30%, 3+ services = +50% above base
3. Project stage multiplier: Ideation = 1.0x, Validation = 1.2x, Growth = 1.5x, M&A / Transaction = 2.5x
4. Engagement type: Retainer = sustained delivery, add +20% to base; One-time = fixed scope pricing
5. Geographic cost index: India / Turkey / SE Asia = 0.7x; MENA / LATAM = 0.85x; US / UK / Europe / ANZ = 1.0x
6. Budget alignment: calibrate final recommendation within or just above the stated budget range where feasible

OUTPUT REQUIRED (respond ONLY with valid JSON, no markdown):
{{
  "recommended_price_usd": <number>,
  "price_range_low": <number>,
  "price_range_high": <number>,
  "pricing_rationale": "<2-3 sentence explanation referencing the client's specific industry, scope, geography, and project stage>",
  "ai_scope_of_work": "<detailed breakdown of what Conssor understood about the project, the core challenges, and exactly how Conssor's vetted experts and governance will ensure success. This should be 3-5 lines maximum.>",
  "estimated_duration_weeks": <number>,
  "confidence_score": <0.0-1.0>
}}
"""


@api_view(['POST'])
@permission_classes([AllowAny])
def client_login(request):
    email = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '')
    if not email or not password:
        return Response({"error": "Email and password are required."}, status=status.HTTP_400_BAD_REQUEST)

    from django.contrib.auth import authenticate
    user = authenticate(username=email, password=password)
    if not user:
        return Response({"error": "Invalid email or password."}, status=status.HTTP_401_UNAUTHORIZED)

    client_data = {"email": user.email, "name": user.first_name}
    try:
        client = Client.objects.get(user=user)
        client_data["client_id"] = str(client.id)
        client_data["organization"] = client.organization_name
    except Client.DoesNotExist:
        pass

    return Response({"success": True, "user": client_data})

@api_view(['POST'])
@permission_classes([AllowAny])
def check_email(request):
    email = request.data.get('email', '').strip().lower()
    if not email:
        return Response({"exists": False})
    from django.contrib.auth.models import User
    exists = User.objects.filter(email__iexact=email).exists()
    return Response({"exists": exists})

@api_view(['POST'])
@permission_classes([AllowAny])
def generate_quote(request):
    data = request.data
    
    # Validation
    project_summary = data.get('project_summary', '').strip()
    if not project_summary or len(project_summary.split()) < 20:
        return Response({"error": "Project summary is required and must be at least 20 words."}, status=status.HTTP_400_BAD_REQUEST)

    # 1. Create the Client stub
    org_name = data.get('organization_name') or 'Individual Client'
    client = Client.objects.create(
        organization_name=org_name,
        contact_name=data.get('full_name', 'Unknown'),
        email=data.get('email', f"temp_{timezone.now().timestamp()}@example.com"),
        phone=data.get('phone', ''),
        country=data.get('country', ''),
        domain_tags=data.get('domain_tags', []),
        engagement_scope=data.get('engagement_scope', []),
        project_stage=data.get('project_stage', ''),
        budget_range=data.get('budget_range', ''),
        project_summary=data.get('project_summary', '')
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
        # Preferred: 70B Versatile, Fallback: 3.1 8B Instant
        content = call_groq_api(
            messages=[{"role": "user", "content": generate_pricing_prompt(client, engagement_type=data.get('engagement_type'))}],
            preferred_model="llama-3.3-70b-versatile",
            fallback_model="llama-3.1-8b-instant",
            response_format={"type": "json_object"}
        )
        pricing = json.loads(content)
        
        # 3. Save Quote
        quote = EngagementQuote.objects.create(
            engagement=engagement,
            ai_recommended_price=pricing.get('recommended_price_usd', 0),
            ai_price_range_low=pricing.get('price_range_low', 0),
            ai_price_range_high=pricing.get('price_range_high', 0),
            ai_rationale=pricing.get('pricing_rationale', ''),
            ai_scope_of_work=pricing.get('ai_scope_of_work', ''),
            ai_confidence_score=pricing.get('confidence_score', 0.5),
            ai_estimated_weeks=pricing.get('estimated_duration_weeks', 4),
            final_price=pricing.get('recommended_price_usd', 0), # Admin can override later
            status='pending_admin'
        )

        # 4. Handle Registration if password provided
        password = data.get('password')
        if password:
            from django.contrib.auth.models import User
            # Check if user already exists
            if not User.objects.filter(email=client.email).exists():
                user = User.objects.create_user(
                    username=client.email,
                    email=client.email,
                    password=password,
                    first_name=client.contact_name.split(' ')[0] if ' ' in client.contact_name else client.contact_name
                )
                client.user = user
                client.save()
        
        return Response({
            "message": "Quote generated and client registered successfully." if password else "Quote generated successfully.",
            "quote_id": quote.id,
            "ai_rationale": quote.ai_rationale,
            "ai_estimated_weeks": quote.ai_estimated_weeks,
            "final_price": quote.final_price
        })

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

CONSSOR_SYSTEM_PROMPT = (
    "You are the Conssor enquiry assistant. Conssor is a premium consulting marketplace that connects "
    "organisations with vetted domain experts across 16+ global industry verticals (Finance, Healthcare, "
    "Energy, Tech, M&A, and more). Engagements are priced transparently by our proprietary AI pricing engine — "
    "no hidden fees. Services include Strategy & Advisory, Digital Transformation, Financial Advisory, "
    "Technical Architecture, M&A Due Diligence, Market Research, and Operations Consulting.\n\n"
    "RULES:\n"
    "- Answer ONLY questions about Conssor, its services, industries, or how it helps clients.\n"
    "- If asked anything unrelated, politely say you can only help with Conssor enquiries.\n"
    "- Keep every reply under 60 words. Be direct and helpful.\n"
    "- Do not collect personal data, run any onboarding protocol, or ask for names/emails/phone numbers.\n"
    "- If the user wants to get started or hire a consultant, tell them to use the registration form on this page."
)

@api_view(['POST'])
@permission_classes([AllowAny])
def advisory_chat(request):
    messages = request.data.get('messages', [])

    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        return Response({"error": "GROQ_API_KEY not configured."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    chat_context = [{"role": "system", "content": CONSSOR_SYSTEM_PROMPT}] + messages[-8:]

    try:
        bot_response = call_groq_api(
            messages=chat_context,
            preferred_model="llama-3.1-8b-instant",
            fallback_model="llama-3.3-70b-versatile",
            max_tokens=120,
        )
        return Response({"message": bot_response})
    except Exception as e:
        return Response({"error": f"AI service unavailable: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def client_overview(_request, client_id):
    try:
        client = Client.objects.get(id=client_id)
    except Client.DoesNotExist:
        return Response({"error": "Client not found."}, status=status.HTTP_404_NOT_FOUND)

    from django.db.models import Sum
    engagements = Engagement.objects.filter(client=client)
    quotes = EngagementQuote.objects.filter(engagement__client=client)
    total_spend = ClientPayment.objects.filter(client=client, status='paid').aggregate(t=Sum('amount'))['t'] or 0

    return Response({
        "client": {
            "id": str(client.id),
            "organization_name": client.organization_name,
            "contact_name": client.contact_name,
            "email": client.email,
            "country": client.country,
            "domain_tags": client.domain_tags,
            "engagement_scope": client.engagement_scope,
            "project_stage": client.project_stage,
            "budget_range": client.budget_range,
            "assignment_status": client.assignment_status,
            "onboarded_at": client.onboarded_at,
        },
        "stats": {
            "active_engagements": engagements.filter(status='active').count(),
            "pending_quotes": quotes.filter(status__in=['pending_admin', 'sent_to_client']).count(),
            "total_spend_usd": float(total_spend),
        }
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def client_quotes(_request, client_id):
    try:
        client = Client.objects.get(id=client_id)
    except Client.DoesNotExist:
        return Response({"error": "Client not found."}, status=status.HTTP_404_NOT_FOUND)

    quotes = EngagementQuote.objects.filter(
        engagement__client=client
    ).select_related('engagement').order_by('-created_at')

    return Response({
        "client": {
            "organization_name": client.organization_name,
            "contact_name": client.contact_name,
            "email": client.email,
            "phone": client.phone,
            "country": client.country,
            "domain_tags": client.domain_tags,
            "engagement_scope": client.engagement_scope,
            "project_stage": client.project_stage,
            "budget_range": client.budget_range,
            "project_summary": client.project_summary,
        },
        "quotes": [{
            "id": str(q.id),
            "scope": q.engagement.scope,
            "stage": q.engagement.stage,
            "ai_recommended_price": float(q.ai_recommended_price),
            "ai_price_range_low": float(q.ai_price_range_low),
            "ai_price_range_high": float(q.ai_price_range_high),
            "ai_rationale": q.ai_rationale,
            "ai_scope_of_work": q.ai_scope_of_work,
            "ai_confidence_score": float(q.ai_confidence_score),
            "ai_estimated_weeks": q.ai_estimated_weeks,
            "final_price": float(q.final_price),
            "status": q.status,
            "created_at": q.created_at,
        } for q in quotes],
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def client_engagements(_request, client_id):
    try:
        client = Client.objects.get(id=client_id)
    except Client.DoesNotExist:
        return Response({"error": "Client not found."}, status=status.HTTP_404_NOT_FOUND)

    engagements = Engagement.objects.filter(client=client).prefetch_related('milestones').select_related('consultant').order_by('-start_date')

    data = []
    for e in engagements:
        consultant_info = None
        if e.consultant:
            c = e.consultant
            consultant_info = {
                "full_name": c.full_name,
                "email": c.email,
                "bio": c.bio,
                "years_experience": c.years_experience,
                "domain_expertise": c.domain_expertise,
                "rating": c.rating,
                "linkedin_url": c.linkedin_url,
            }
        data.append({
            "id": str(e.id),
            "scope": e.scope,
            "stage": e.stage,
            "status": e.status,
            "start_date": str(e.start_date),
            "end_date": str(e.end_date) if e.end_date else None,
            "consultant": consultant_info,
            "milestones": [{
                "id": str(m.id),
                "name": m.name,
                "due_date": str(m.due_date),
                "status": m.status,
                "owner": m.owner,
                "notes": m.notes,
            } for m in e.milestones.all().order_by('due_date')],
        })

    return Response({"engagements": data})
