FROM node:20-bullseye-slim

WORKDIR /app

# Dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Chromium install
RUN apt-get update && \
    apt-get install -y chromium && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY . .

ENV NODE_ENV=production
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

EXPOSE 3001

CMD ["node", "index.js"]