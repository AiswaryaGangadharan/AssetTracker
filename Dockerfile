# Use official Python image
FROM python:3.10

# Set working directory
WORKDIR /app

# Copy app folder into container
COPY ./app /app

# Install dependencies
RUN pip install --no-cache-dir fastapi uvicorn

# Run the app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]