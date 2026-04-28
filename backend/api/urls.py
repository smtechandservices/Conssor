from django.urls import path
from . import views

urlpatterns = [
    path('quotes/generate/', views.generate_quote, name='generate_quote'),
    path('auth/login/', views.client_login, name='client_login'),
    path('auth/check-email/', views.check_email, name='check_email'),
    path('advisory/chat/', views.advisory_chat, name='advisory_chat'),
    path('client/<uuid:client_id>/overview/', views.client_overview, name='client_overview'),
    path('client/<uuid:client_id>/quotes/', views.client_quotes, name='client_quotes'),
    path('client/<uuid:client_id>/engagements/', views.client_engagements, name='client_engagements'),
    path('client/<uuid:client_id>/payments/', views.client_payments, name='client_payments'),
    path('payments/process/', views.process_payment, name='process_payment'),
    path('consultant/register/', views.consultant_register, name='consultant_register'),
    path('consultant/login/', views.consultant_login, name='consultant_login'),
    path('consultant/<uuid:consultant_id>/dashboard/', views.consultant_dashboard, name='consultant_dashboard'),
    path('consultant/<uuid:consultant_id>/clients/', views.consultant_clients, name='consultant_clients'),
    path('consultant/<uuid:consultant_id>/assigned-leads/', views.consultant_assigned_leads, name='consultant_assigned_leads'),
    path('consultant/profile/<uuid:consultant_id>/', views.consultant_profile, name='consultant_profile'),
    path('consultant/leads/respond/', views.consultant_respond_lead, name='consultant_respond_lead'),
    path('consultant/leads/negotiate/', views.consultant_negotiate_lead, name='consultant_negotiate_lead'),
    path('engagements/<uuid:engagement_id>/messages/', views.get_messages, name='get_messages'),
    path('engagements/<uuid:engagement_id>/messages/send/', views.send_message, name='send_message'),
    
    # Superadmin Routes
    path('admin/stats/', views.admin_dashboard_stats, name='admin_stats'),
    path('admin/projects/unassigned/', views.admin_list_unassigned_engagements, name='admin_unassigned'),
    path('admin/projects/all/', views.admin_list_all_engagements, name='admin_all_projects'),
    path('admin/projects/assign/', views.admin_assign_consultant, name='admin_assign_consultant'),
    path('admin/leads/', views.admin_list_leads, name='admin_leads'),
    path('admin/leads/update/', views.admin_update_lead_status, name='admin_update_lead_status'),
    path('admin/consultants/', views.admin_list_consultants, name='admin_consultants'),
    path('admin/clients/', views.admin_list_clients, name='admin_clients'),
]
