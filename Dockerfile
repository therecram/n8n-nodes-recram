FROM docker.n8n.io/n8nio/n8n:latest

USER root

# Copy the custom node package
COPY package.json /tmp/n8n-nodes-recram/package.json
COPY dist/ /tmp/n8n-nodes-recram/dist/

# Install into n8n's custom nodes directory
RUN mkdir -p /home/node/.n8n/nodes && \
    cd /home/node/.n8n/nodes && \
    npm init -y 2>/dev/null && \
    npm install /tmp/n8n-nodes-recram --save && \
    chown -R node:node /home/node/.n8n/nodes

USER node
