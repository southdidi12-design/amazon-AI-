from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('api/run/', views.RunBotAPIView.as_view(), name='api-run'),
    path('api/reports/', views.ListReportsAPIView.as_view(), name='api-reports'),
]
