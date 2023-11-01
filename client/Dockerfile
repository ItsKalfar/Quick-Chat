FROM node:latest

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json .

# Install dependencies
ENV APP_ENV 'production'
RUN npm install

# Bundle app source
COPY . .

RUN npm run build

# Expose the port that your Express app is running on
EXPOSE 3000

CMD [ "node", "dist/main.js"]