FROM node:12.6

WORKDIR /usr/src/app

# copy both files: package.json и package-lock.json
#COPY ./src/package*.json .

#RUN npm install
# If you build production image use:
# RUN npm ci --only=production

# copy src code
COPY ./src/ .

EXPOSE 3000
CMD [ "npm", "start" ]