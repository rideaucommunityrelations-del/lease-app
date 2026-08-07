FROM node:20-slim

# LibreOffice provides the `soffice` binary that lib/pdfConvert.js shells out
# to for converting generated .docx leases to PDF. fonts-liberation supplies
# Word-metric-compatible fonts so pagination/line breaks match what Word
# would produce.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libreoffice-writer \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production

CMD ["node", "server.js"]
