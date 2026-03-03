from django.db import models


class Report(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    # 保存结构化的优化结果（JSON）
    data = models.JSONField()

    def __str__(self):
        return f"Report {self.id} @ {self.created_at.isoformat()}"
