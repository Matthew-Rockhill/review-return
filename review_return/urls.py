# review_return/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('marketing.urls')),
    path('portal/', include('portal.urls')),
    path('accounts/', include('accounts.urls')),
    path('survey/', include('survey.urls')),
    path('hq/', include('hq.urls')),
    path("__reload__/", include("django_browser_reload.urls")),  # For Tailwind development
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)