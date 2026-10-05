FROM node:22-alpine

ENV NODE_ENV=production
ENV PORT=5000

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --chown=node:node . .
RUN mkdir -p public/uploads && chown -R node:node public

USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:5000/').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["npm", "start"]
