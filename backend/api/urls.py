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
]
