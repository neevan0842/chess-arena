# Use an official Python 3.10 image as a base
FROM python:3.10-slim

# Set the working directory to /code
WORKDIR /code

# Install dependencies
RUN apt update && apt install -y stockfish

# Copy the requirements file
COPY ./requirements.txt /code/requirements.txt

# Install the requirements
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy the code
COPY . /code

# Expose the port the app will run on
EXPOSE 8000

# Set the default command to run the app with FastAPI
CMD ["fastapi", "dev"]

