import os
import json
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from groq import Groq
from .models import Client, Engagement, EngagementQuote, ClientPayment, Consultant, Message, Lead, Payout

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
def consultant_login(request):
    email = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '')
    if not email or not password:
        return Response({"error": "Email and password are required."}, status=status.HTTP_400_BAD_REQUEST)

    from django.contrib.auth import authenticate
    user = authenticate(username=email, password=password)
    if not user:
        return Response({"error": "Invalid email or password."}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        consultant = Consultant.objects.get(user=user)
        consultant_data = {
            "email": user.email,
            "name": consultant.full_name,
            "consultant_id": str(consultant.id),
        }
        return Response({"success": True, "user": consultant_data})
    except Consultant.DoesNotExist:
        return Response({"error": "Consultant profile not found for this user."}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([AllowAny])
def consultant_register(request):
    data = request.data
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    full_name = data.get('full_name', '')
    linkedin_url = data.get('linkedin', '')

    if not email or not password or not full_name:
        return Response({"error": "Email, password and full name are required."}, status=status.HTTP_400_BAD_REQUEST)

    from django.contrib.auth.models import User
    if User.objects.filter(email=email).exists():
        return Response({"error": "Email already registered."}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(
        username=email,
        email=email,
        password=password,
        first_name=full_name.split(' ')[0] if ' ' in full_name else full_name
    )

    consultant = Consultant.objects.create(
        user=user,
        full_name=full_name,
        email=email,
        linkedin_url=linkedin_url
    )

    return Response({
        "success": True,
        "message": "Consultant application submitted successfully.",
        "consultant_id": str(consultant.id)
    })

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

    # 1. Create or Update the Client
    client_email = data.get('email', f"temp_{timezone.now().timestamp()}@example.com")
    org_name = data.get('organization_name') or 'Individual Client'
    
    client, created = Client.objects.update_or_create(
        email=client_email,
        defaults={
            'organization_name': org_name,
            'contact_name': data.get('full_name', 'Unknown'),
            'phone': data.get('phone', ''),
            'country': data.get('country', ''),
            'domain_tags': data.get('domain_tags', []),
            'engagement_scope': data.get('engagement_scope', []),
            'project_stage': data.get('project_stage', ''),
            'budget_range': data.get('budget_range', ''),
            'project_summary': data.get('project_summary', '')
        }
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
            
        # Financial stats
        try:
            quote = EngagementQuote.objects.filter(engagement=e).latest('created_at')
            total_price = float(quote.final_price)
        except EngagementQuote.DoesNotExist:
            total_price = 0
            
        payments = ClientPayment.objects.filter(engagement=e, status='paid')
        paid_amount = sum(float(p.amount) for p in payments)
        first_p = payments.first()
        
        data.append({
            "id": str(e.id),
            "scope": e.scope,
            "stage": e.stage,
            "status": e.status,
            "payment_status": e.payment_status,
            "financials": {
                "total_price": total_price,
                "paid_amount": paid_amount,
                "remaining_amount": total_price - paid_amount,
                "paid_count": payments.count(),
                "total_parts": first_p.total_installments if first_p else 1,
            },
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


@api_view(['GET'])
@permission_classes([AllowAny])
def engagement_detail(_request, engagement_id):
    try:
        e = Engagement.objects.select_related('consultant', 'client').prefetch_related('milestones').get(id=engagement_id)
    except (Engagement.DoesNotExist, ValueError):
        return Response({"error": "Engagement not found."}, status=status.HTTP_404_NOT_FOUND)

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

    return Response({
        "engagement": {
            "id": str(e.id),
            "scope": e.scope,
            "stage": e.stage,
            "status": e.status,
            "payment_status": e.payment_status,
            "start_date": str(e.start_date),
            "end_date": str(e.end_date) if e.end_date else None,
            "consultant": consultant_info,
            "client": {
                "organization_name": e.client.organization_name,
                "project_summary": e.client.project_summary,
                "domain_tags": e.client.domain_tags,
            },
            "milestones": [{
                "id": str(m.id),
                "name": m.name,
                "due_date": str(m.due_date),
                "status": m.status,
                "owner": m.owner,
                "notes": m.notes,
            } for m in e.milestones.all().order_by('due_date')],
        }
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def process_payment(request):
    engagement_id = request.data.get('engagement_id')
    installments = int(request.data.get('installments', 1))
    action = request.data.get('action', 'initial') # initial, next, settle
    
    try:
        engagement = Engagement.objects.get(id=engagement_id)
        quote = EngagementQuote.objects.filter(engagement=engagement).latest('created_at')
    except (Engagement.DoesNotExist, EngagementQuote.DoesNotExist):
        return Response({"error": "Engagement or active quote not found."}, status=status.HTTP_404_NOT_FOUND)

    total_amount = float(quote.final_price)
    
    # Calculate how many installments exist
    existing_payments = ClientPayment.objects.filter(engagement=engagement, status='paid').count()
    
    if action == 'initial':
        installment_amount = total_amount / installments
        current_installment = 1
        total_parts = installments
    elif action == 'next':
        # Find the installment setup from the first payment
        first_payment = ClientPayment.objects.filter(engagement=engagement, status='paid').first()
        if not first_payment:
            return Response({"error": "No initial payment found."}, status=status.HTTP_400_BAD_REQUEST)
        total_parts = first_payment.total_installments
        installment_amount = total_amount / total_parts
        current_installment = existing_payments + 1
    elif action == 'settle':
        first_payment = ClientPayment.objects.filter(engagement=engagement, status='paid').first()
        if not first_payment:
            return Response({"error": "No initial payment found."}, status=status.HTTP_400_BAD_REQUEST)
        total_parts = first_payment.total_installments
        already_paid = (total_amount / total_parts) * existing_payments
        installment_amount = total_amount - already_paid
        current_installment = total_parts # Mark as reaching the end
    else:
        return Response({"error": "Invalid action."}, status=status.HTTP_400_BAD_REQUEST)

    import uuid
    payment = ClientPayment.objects.create(
        engagement=engagement,
        client=engagement.client,
        quote=quote,
        amount=installment_amount,
        currency='USD',
        gateway='Simulation',
        gateway_payment_id=f"SIM_{uuid.uuid4().hex[:10]}",
        installment_number=current_installment,
        total_installments=total_parts if action != 'settle' else first_payment.total_installments,
        platform_fee_pct=0.12,
        platform_fee_amount=installment_amount * 0.12,
        consultant_payout_amount=installment_amount * 0.88,
        status='paid',
        paid_at=timezone.now()
    )
    
    # Final status update
    total_paid_count = ClientPayment.objects.filter(engagement=engagement, status='paid').count()
    first_p = ClientPayment.objects.filter(engagement=engagement, status='paid').first()
    
    if action == 'settle' or (first_p and total_paid_count >= first_p.total_installments):
        engagement.payment_status = 'paid'
    else:
        engagement.payment_status = 'partially_paid'
    
    engagement.save()
    
    return Response({
        "success": True,
        "message": f"Payment of ${installment_amount:,.2f} processed. Current status: {engagement.payment_status}",
        "payment_status": engagement.payment_status
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def client_payments(_request, client_id):
    try:
        client = Client.objects.get(id=client_id)
    except Client.DoesNotExist:
        return Response({"error": "Client not found."}, status=status.HTTP_404_NOT_FOUND)

    payments = ClientPayment.objects.filter(client=client).select_related('engagement', 'quote').order_by('-paid_at')

    return Response({
        "payments": [{
            "id": str(p.id),
            "engagement_scope": p.engagement.scope,
            "amount": float(p.amount),
            "currency": p.currency,
            "installment": f"{p.installment_number}/{p.total_installments}",
            "status": p.status,
            "paid_at": p.paid_at.strftime("%Y-%m-%d %H:%M") if p.paid_at else None,
            "gateway_payment_id": p.gateway_payment_id,
        } for p in payments]
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def consultant_dashboard(_request, consultant_id):
    try:
        consultant = Consultant.objects.get(id=consultant_id)
    except Consultant.DoesNotExist:
        return Response({"error": "Consultant not found."}, status=status.HTTP_404_NOT_FOUND)

    from django.db.models import Sum
    active_engagements = Engagement.objects.filter(consultant=consultant, status='active')
    total_earnings = ClientPayment.objects.filter(engagement__consultant=consultant, status='paid').aggregate(t=Sum('consultant_payout_amount'))['t'] or 0
    
    # Mock data for upcoming sessions and pending KYC for now
    return Response({
        "stats": {
            "active_clients": active_engagements.count(),
            "total_earnings_usd": float(total_earnings),
            "upcoming_sessions": 3,
            "pending_kyc": 2 if consultant.kyc_status != 'verified' else 0,
        },
        "recent_activity": [
            {"event": "System login", "time": "Just now"},
            {"event": "Profile updated", "time": "2 hours ago"}
        ]
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def consultant_clients(_request, consultant_id):
    try:
        consultant = Consultant.objects.get(id=consultant_id)
    except Consultant.DoesNotExist:
        return Response({"error": "Consultant not found."}, status=status.HTTP_404_NOT_FOUND)

    engagements = Engagement.objects.filter(
        consultant=consultant, 
        consultant_acceptance_status='accepted'
    ).select_related('client')
    
    return Response({
        "clients": [{
            "id": str(e.client.id),
            "engagement_id": str(e.id),
            "name": e.client.organization_name,
            "contact": e.client.contact_name,
            "domain": e.client.domain_tags[0] if e.client.domain_tags else "General",
            "stage": e.stage,
            "status": e.status,
            "start": str(e.start_date)
        } for e in engagements]
    })

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def consultant_profile(request, consultant_id):
    try:
        consultant = Consultant.objects.get(id=consultant_id)
    except Consultant.DoesNotExist:
        return Response({"error": "Consultant not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response({
            "profile": {
                "full_name": consultant.full_name,
                "email": consultant.email,
                "phone": consultant.phone,
                "bio": consultant.bio,
                "years_experience": consultant.years_experience,
                "linkedin_url": consultant.linkedin_url,
                "domain_expertise": consultant.domain_expertise,
                "resume_url": consultant.resume_url,
                "kyc_status": consultant.kyc_status,
                "availability_status": consultant.availability_status,
                "rating": consultant.rating,
            }
        })
    
    elif request.method == 'POST':
        data = request.data
        consultant.full_name = data.get('full_name', consultant.full_name)
        consultant.phone = data.get('phone', consultant.phone)
        consultant.bio = data.get('bio', consultant.bio)
        consultant.years_experience = data.get('years_experience', consultant.years_experience)
        consultant.linkedin_url = data.get('linkedin_url', consultant.linkedin_url)
        consultant.domain_expertise = data.get('domain_expertise', consultant.domain_expertise)
        consultant.resume_url = data.get('resume_url', consultant.resume_url)
        consultant.availability_status = data.get('availability_status', consultant.availability_status)
        consultant.save()
        return Response({"success": True, "message": "Profile updated successfully."})

@api_view(['GET'])
@permission_classes([AllowAny])
def consultant_assigned_leads(_request, consultant_id):
    try:
        consultant = Consultant.objects.get(id=consultant_id)
    except Consultant.DoesNotExist:
        return Response({"error": "Consultant not found."}, status=status.HTTP_404_NOT_FOUND)

    # Leads are engagements with status='assigned' or 'active' but acceptance is pending
    leads = Engagement.objects.filter(
        consultant=consultant,
        consultant_acceptance_status__in=['pending', 'declined']
    ).select_related('client').prefetch_related('quotes')

    data = []
    for lead in leads:
        try:
            quote = lead.quotes.latest('created_at')
            price_info = {
                "ai_price": float(quote.ai_recommended_price),
                "final_price": float(quote.final_price),
                "counter_price": float(quote.counter_price) if quote.counter_price else None,
                "status": quote.status
            }
        except EngagementQuote.DoesNotExist:
            price_info = None

        data.append({
            "id": str(lead.id),
            "client_name": lead.client.organization_name,
            "project_summary": lead.client.project_summary,
            "domain_tags": lead.client.domain_tags,
            "scope": lead.scope,
            "stage": lead.stage,
            "acceptance_status": lead.consultant_acceptance_status,
            "price_info": price_info,
            "created_at": lead.created_at
        })

    return Response({"leads": data})

@api_view(['POST'])
@permission_classes([AllowAny])
def consultant_respond_lead(request):
    engagement_id = request.data.get('engagement_id')
    response_action = request.data.get('action') # 'accept' or 'decline'
    
    try:
        engagement = Engagement.objects.get(id=engagement_id)
    except Engagement.DoesNotExist:
        return Response({"error": "Engagement not found."}, status=status.HTTP_404_NOT_FOUND)

    if response_action == 'accept':
        engagement.consultant_acceptance_status = 'accepted'
        engagement.status = 'active'
        engagement.save()
        return Response({"success": True, "message": "Lead accepted. Engagement is now active."})
    elif response_action == 'decline':
        engagement.consultant_acceptance_status = 'declined'
        # If declined, it should probably be unassigned from this consultant
        engagement.consultant = None
        engagement.save()
        
        # Also update client assignment status
        client = engagement.client
        client.assignment_status = 'unassigned'
        client.save()
        
        return Response({"success": True, "message": "Lead declined and returned to unmatched pool."})
    else:
        return Response({"error": "Invalid action."}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def consultant_negotiate_lead(request):
    engagement_id = request.data.get('engagement_id')
    counter_price = request.data.get('counter_price')
    reason = request.data.get('reason')
    
    try:
        engagement = Engagement.objects.select_related('client').get(id=engagement_id)
        quote = engagement.quotes.latest('created_at')
    except (Engagement.DoesNotExist, EngagementQuote.DoesNotExist):
        return Response({"error": "Engagement or quote not found."}, status=status.HTTP_404_NOT_FOUND)

    # Call AI to mediate
    negotiation_prompt = f"""
You are CONSSOR's AI Conflict Mediator. A consultant is disagreeing with the AI-generated price for a project.
Analyze the original project and the consultant's counter-proposal, then settle on a final fair price.

PROJECT DETAILS:
- Client: {engagement.client.organization_name}
- Scope: {engagement.scope}
- Original AI Price: ${quote.ai_recommended_price}
- AI Rationale: {quote.ai_rationale}

CONSULTANT COUNTER-PROPOSAL:
- Requested Price: ${counter_price}
- Consultant's Reason: "{reason}"

RULES:
1. You must settle on a SINGLE final price.
2. If the consultant's reason is valid (e.g., hidden complexity), move the price closer to their request.
3. If the reason is vague, stay closer to the original AI price.
4. Output ONLY valid JSON.

OUTPUT FORMAT:
{{
  "settled_price": <number>,
  "mediation_note": "<1-2 sentence explanation of why this price was chosen>"
}}
"""
    try:
        content = call_groq_api(
            messages=[{"role": "user", "content": negotiation_prompt}],
            preferred_model="llama-3.1-8b-instant",
            fallback_model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"}
        )
        mediation = json.loads(content)
        
        quote.final_price = mediation.get('settled_price', quote.final_price)
        quote.negotiation_reason = f"CONSULTANT: {reason} | AI MEDIATOR: {mediation.get('mediation_note')}"
        quote.status = 'accepted' # Automatically accept the settled price for MVP
        quote.save()

        # Update engagement status if needed
        engagement.consultant_acceptance_status = 'accepted'
        engagement.status = 'active'
        engagement.save()

        return Response({
            "success": True, 
            "message": f"AI Mediator has settled the price at ${quote.final_price}. Lead is now accepted.",
            "settled_price": float(quote.final_price),
            "note": mediation.get('mediation_note')
        })
    except Exception as e:
        return Response({"error": f"AI mediation failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_messages(_request, engagement_id):
    try:
        messages = Message.objects.filter(engagement_id=engagement_id).order_by('created_at')
        return Response({
            "messages": [{
                "id": str(m.id),
                "sender_type": m.sender_type,
                "sender_id": str(m.sender_id),
                "text": m.text,
                "created_at": m.created_at,
                "is_read": m.is_read
            } for m in messages]
        })
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def send_message(request, engagement_id):
    try:
        data = request.data
        msg = Message.objects.create(
            engagement_id=engagement_id,
            sender_type=data.get('sender_type'),
            sender_id=data.get('sender_id'),
            text=data.get('text')
        )
        return Response({
            "success": True,
            "message": {
                "id": str(msg.id),
                "created_at": msg.created_at
            }
        })
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- SUPERADMIN VIEWS ---

@api_view(['GET'])
@permission_classes([AllowAny])
def admin_dashboard_stats(_request):
    from django.db.models import Sum
    
    total_revenue = ClientPayment.objects.filter(status='paid').aggregate(t=Sum('amount'))['t'] or 0
    total_clients = Client.objects.count()
    total_consultants = Consultant.objects.count()
    active_projects = Engagement.objects.filter(status='active').count()
    unassigned_projects = Engagement.objects.filter(consultant__isnull=True).count()
    pending_leads = Lead.objects.filter(pipeline_stage='submitted').count()
    
    return Response({
        "stats": {
            "total_revenue": float(total_revenue),
            "total_clients": total_clients,
            "total_consultants": total_consultants,
            "active_projects": active_projects,
            "unassigned_projects": unassigned_projects,
            "pending_leads": pending_leads
        }
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def admin_list_unassigned_engagements(_request):
    engagements = Engagement.objects.filter(consultant__isnull=True).select_related('client').order_by('-created_at')
    
    return Response({
        "engagements": [{
            "id": str(e.id),
            "client_name": e.client.organization_name,
            "scope": e.scope,
            "stage": e.stage,
            "created_at": e.created_at,
            "status": e.status
        } for e in engagements]
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def admin_assign_consultant(request):
    engagement_id = request.data.get('engagement_id')
    consultant_id = request.data.get('consultant_id')
    
    try:
        engagement = Engagement.objects.get(id=engagement_id)
        consultant = Consultant.objects.get(id=consultant_id)
        
        engagement.consultant = consultant
        engagement.consultant_acceptance_status = 'pending'
        engagement.save()
        
        # Update client status as well
        client = engagement.client
        client.assigned_consultant_id = consultant.id
        client.assignment_status = 'assigned'
        client.save()
        
        return Response({"success": True, "message": f"Assigned {consultant.full_name} to project."})
    except (Engagement.DoesNotExist, Consultant.DoesNotExist):
        return Response({"error": "Engagement or Consultant not found."}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([AllowAny])
def admin_list_leads(_request):
    leads = Lead.objects.select_related('submitted_by').order_by('-submitted_at')
    
    return Response({
        "leads": [{
            "id": str(l.id),
            "submitted_by": l.submitted_by.full_name,
            "organization_name": l.organization_name,
            "contact_email": l.contact_email,
            "domain": l.domain,
            "estimated_value": float(l.estimated_value),
            "pipeline_stage": l.pipeline_stage,
            "submitted_at": l.submitted_at
        } for l in leads]
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def admin_update_lead_status(request):
    lead_id = request.data.get('lead_id')
    new_stage = request.data.get('pipeline_stage')
    
    try:
        lead = Lead.objects.get(id=lead_id)
        lead.pipeline_stage = new_stage
        lead.save()
        return Response({"success": True, "message": "Lead status updated."})
    except Lead.DoesNotExist:
        return Response({"error": "Lead not found."}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([AllowAny])
def admin_list_consultants(_request):
    consultants = Consultant.objects.all().order_by('-onboarded_at')
    
    return Response({
        "consultants": [{
            "id": str(c.id),
            "full_name": c.full_name,
            "email": c.email,
            "expertise": c.domain_expertise,
            "status": c.availability_status,
            "kyc": c.kyc_status,
            "rating": c.rating
        } for c in consultants]
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def admin_list_clients(_request):
    clients = Client.objects.all().order_by('-onboarded_at')
    
    return Response({
        "clients": [{
            "id": str(c.id),
            "organization": c.organization_name,
            "contact": c.contact_name,
            "email": c.email,
            "country": c.country,
            "status": c.assignment_status
        } for c in clients]
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def admin_list_all_engagements(_request):
    engagements = Engagement.objects.select_related('client', 'consultant').order_by('-created_at')
    
    return Response({
        "engagements": [{
            "id": str(e.id),
            "client_name": e.client.organization_name,
            "consultant_name": e.consultant.full_name if e.consultant else "Unassigned",
            "status": e.status,
            "payment_status": e.payment_status,
            "start_date": e.start_date,
            "scope": e.scope
        } for e in engagements]
    })
