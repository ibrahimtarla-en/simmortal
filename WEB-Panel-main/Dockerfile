FROM node:20-alpine

# Set the working directory to /app
WORKDIR /app

ARG NEXT_PUBLIC_APP_ENV
ENV NEXT_PUBLIC_APP_ENV=${NEXT_PUBLIC_APP_ENV}

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./
COPY yarn.lock ./

# Install dependencies
RUN yarn

# Copy the local code into the container at /app
COPY . .

# Build the Next.js application
RUN yarn build

# Expose the port that Next.js will run on
EXPOSE 3000

# Define the command to run your application
CMD ["yarn", "start"]