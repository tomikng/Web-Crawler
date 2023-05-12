# Use an official Python runtime as the base image
FROM python:3.10

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install project dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the Django project code into the container
COPY . .

# Expose the port on which your Django application will run
#EXPOSE 8000

# Set the entrypoint command for the container
CMD ["python", "manage.py", "runserver"]
