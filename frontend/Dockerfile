# Use the official Bun image
FROM oven/bun:latest

# Set the working directory
WORKDIR /code

# Copy dependency manifests for caching
COPY package.json bun.lock ./

# Install dependencies with Bun
RUN bun install

# Copy the rest of your source code
COPY . .

# Expose the default Vite dev server port (adjust if needed)
EXPOSE 5173

# Run the development server with hot reload and bind to all interfaces
CMD ["bun", "run", "dev", "--host"]
