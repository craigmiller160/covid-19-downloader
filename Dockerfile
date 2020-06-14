FROM node:12.16.1

WORKDIR /usr/src/app

COPY ./build/covid-19-downloader-*.zip ./covid-19-downloader.zip
RUN unzip covid-19-downloader.zip

RUN npm set registry http://verdaccio:30000/

RUN yarn

CMD ["yarn", "start:prod"]
