FROM python:3.10

WORKDIR /app

COPY ./app /app

RUN pip install --no-cache-dir fastapi uvicorn

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
