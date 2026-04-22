from django.urls import path
from . import views

urlpatterns = [
    path('quotes/generate/', views.generate_quote, name='generate_quote'),
]
