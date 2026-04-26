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
    path('consultant/<uuid:consultant_id>/leads/', views.consultant_leads, name='consultant_leads'),
]
