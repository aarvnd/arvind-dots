FROM mcr.microsoft.com/playwright:v1.62.1-noble

WORKDIR /opt/arvind-dots-computer

COPY package.json ./
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
RUN npm install --omit=dev --ignore-scripts

COPY driver.mjs ./
RUN mkdir -p /workspace \
    && chown -R pwuser:pwuser /opt/arvind-dots-computer /workspace

USER pwuser
ENV PORT=3000
ENV WORKSPACE=/workspace
EXPOSE 3000

ENTRYPOINT ["node", "/opt/arvind-dots-computer/driver.mjs"]
