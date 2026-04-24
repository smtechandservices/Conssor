from django.contrib import admin
from .models import (
    Client, Consultant, KYCDocument, Engagement,
    Milestone, Lead, Payout, EngagementQuote,
    ClientPayment, ConsultantSubscription
)

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('organization_name', 'contact_name', 'email', 'country', 'assignment_status', 'onboarded_at')
    search_fields = ('organization_name', 'contact_name', 'email')
    list_filter = ('assignment_status',)
    fields = (
        'organization_name', 'contact_name', 'email', 'phone', 'country',
        'domain_tags', 'engagement_scope', 'project_stage', 'budget_range',
        'project_summary', 'assignment_status', 'user',
    )

@admin.register(Consultant)
class ConsultantAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'kyc_status', 'availability_status', 'active_client_count', 'rating')
    search_fields = ('full_name', 'email')
    list_filter = ('kyc_status', 'availability_status')

@admin.register(KYCDocument)
class KYCDocumentAdmin(admin.ModelAdmin):
    list_display = ('consultant', 'document_type', 'status', 'submitted_at')
    list_filter = ('status', 'document_type')
    search_fields = ('consultant__full_name',)

@admin.register(Engagement)
class EngagementAdmin(admin.ModelAdmin):
    list_display = ('client', 'consultant', 'stage', 'status', 'start_date')
    list_filter = ('status', 'stage')
    search_fields = ('client__organization_name', 'consultant__full_name')

@admin.register(Milestone)
class MilestoneAdmin(admin.ModelAdmin):
    list_display = ('name', 'engagement', 'due_date', 'status', 'owner')
    list_filter = ('status', 'owner')
    search_fields = ('name', 'engagement__client__organization_name')

@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ('organization_name', 'submitted_by', 'estimated_value', 'pipeline_stage', 'referral_bonus_status')
    list_filter = ('pipeline_stage', 'referral_bonus_status')
    search_fields = ('organization_name', 'submitted_by__full_name')

@admin.register(Payout)
class PayoutAdmin(admin.ModelAdmin):
    list_display = ('consultant', 'period_month', 'period_year', 'total_due', 'status')
    list_filter = ('status', 'period_month', 'period_year')
    search_fields = ('consultant__full_name',)

@admin.register(EngagementQuote)
class EngagementQuoteAdmin(admin.ModelAdmin):
    list_display = ('engagement', 'final_price', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('engagement__client__organization_name',)

@admin.register(ClientPayment)
class ClientPaymentAdmin(admin.ModelAdmin):
    list_display = ('engagement', 'amount', 'currency', 'status', 'gateway', 'created_at')
    list_filter = ('status', 'gateway', 'currency')
    search_fields = ('engagement__client__organization_name',)

@admin.register(ConsultantSubscription)
class ConsultantSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('consultant', 'plan', 'billing_cycle', 'status', 'current_period_end')
    list_filter = ('status', 'plan', 'billing_cycle')
    search_fields = ('consultant__full_name',)
