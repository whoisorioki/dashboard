# Use official Python image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Copy requirements
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire app
COPY . .

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Run Streamlit app on port 8080
CMD ["streamlit", "run", "dash.py", "--server.port=8080", "--server.address=0.0.0.0"]