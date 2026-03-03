from django.contrib import admin
from .models import Report

# 设置 admin 界面中文标题
admin.site.site_header = "亚马逊广告监控后台"
admin.site.site_title = "广告监控"


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('id', 'created_at')
    readonly_fields = ('created_at',)
