# Stage 1: Build React app
FROM node:20-slim AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:20-slim

WORKDIR /app

# Install Python and dependencies
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Fix python symlink
RUN ln -s /usr/bin/python3 /usr/bin/python

# Copy build files and server
COPY --from=build /app/dist ./dist
COPY --from=build /app/server.js ./
COPY --from=build /app/var_calculator.py ./
COPY --from=build /app/package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Install Python requirements
# pandas, numpy, scipy can be heavy, we install them directly
RUN pip3 install --no-cache-dir yfinance pandas numpy scipy --break-system-packages

EXPOSE 3000

CMD ["node", "server.js"]
