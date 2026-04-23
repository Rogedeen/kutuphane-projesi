FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

# Next.js dev server needs to bind to 0.0.0.0 inside container
# This is usually done by starting with `npm run dev` but we will set an environment variable just in case.
ENV HOST=0.0.0.0

EXPOSE 3000

CMD ["npm", "run", "dev"]
