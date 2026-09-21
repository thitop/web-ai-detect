FROM python:3.10-slim

WORKDIR /app

# ลดขนาด image เล็กลง
RUN apt-get update && apt-get install -y build-essential libsndfile1 --no-install-recommends && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

COPY . .

ENV PORT=8000

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
