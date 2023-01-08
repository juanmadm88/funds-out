FROM hub.fif.tech/base/fif-common-pm2:12-alpine-latest

COPY --chown=node:node . .

ARG BUILDNUMBER

ENV BUILDNUMBER $BUILDNUMBER

#EXPOSE 3000

CMD ["/bin/sh", "/startup.sh"]