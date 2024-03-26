# pull official base image
FROM node:latest

# set working directory
WORKDIR /

# add `/app/node_modules/.bin` to $PATH
ENV PATH node_modules/.bin:$PATH

# install app dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm install --silent
RUN echo $REACT_APP_FLAKE_API_URL

# add app
COPY . ./

# start app
CMD ["npm", "start"]
