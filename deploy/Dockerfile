FROM node:12.16.1

WORKDIR /usr/src/app

COPY build/covid-19-downloader-*.tgz ./covid-19-downloader.tgz
RUN tar xvf covid-19-downloader.tgz
RUN cp -R package/* .
RUN rm -rf package

RUN npm set registry https://craigmiller160.ddns.net:30003/repository/npm-group/

RUN yarn

CMD ["yarn", "start:prod"]
