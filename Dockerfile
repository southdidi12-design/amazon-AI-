FROM python:3.9-slim
WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y build-essential && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/requirements.txt
RUN python -m pip install --upgrade pip
RUN pip install -r requirements.txt

COPY . /app

ENV PYTHONUNBUFFERED=1
EXPOSE 8000

CMD ["gunicorn", "dashboard.wsgi:application", "--bind", "0.0.0.0:8000"]
