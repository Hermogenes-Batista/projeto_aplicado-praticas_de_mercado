FROM node:20-alpine

WORKDIR /app

# Copia apenas os manifestos para aproveitar o cache do Docker
COPY package.json package-lock.json* ./

# Usa '--legacy-peer-deps' para evitar os conflitos de dependência do npm que vimos anteriormente
RUN npm ci --legacy-peer-deps

# Copia o restante do código-fonte
COPY . .

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "run", "dev"]
