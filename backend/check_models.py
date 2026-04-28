import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'conssor_core.settings')
django.setup()

from api.models import Consultant, Engagement, EngagementQuote

print("Consultant fields:")
for field in Consultant._meta.fields:
    print(f" - {field.name}")

print("\nEngagement fields:")
for field in Engagement._meta.fields:
    print(f" - {field.name}")

print("\nEngagementQuote fields:")
for field in EngagementQuote._meta.fields:
    print(f" - {field.name}")
