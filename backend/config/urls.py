from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

admin.site.site_header = "Lezecké centrum – administrácia"
admin.site.site_title = "Lezecké centrum"
admin.site.index_title = "Správa zón, cenníka, kurzov a prihlášok"

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("climbing.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
