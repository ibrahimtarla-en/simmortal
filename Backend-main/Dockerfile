FROM node:20-alpine

ENV PORT="8080"


ENV POSTGRES_HOST="aws-0-eu-central-1.pooler.supabase.com"

COPY . .

RUN yarn

RUN yarn build

CMD yarn start:prod