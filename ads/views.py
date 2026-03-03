from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .service import run_bot_and_get_results
from .models import Report
from .serializers import ReportSerializer


class RunBotAPIView(APIView):
    def post(self, request):
        records = run_bot_and_get_results()
        report = Report.objects.create(data=records)
        serializer = ReportSerializer(report)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ListReportsAPIView(APIView):
    def get(self, request):
        qs = Report.objects.order_by('-created_at')[:20]
        serializer = ReportSerializer(qs, many=True)
        return Response(serializer.data)


def index(request):
    return render(request, 'index.html')
