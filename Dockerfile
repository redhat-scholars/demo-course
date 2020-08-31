FROM docker.io/antora/antora as builder

ADD . /antora/

RUN antora generate --stacktrace site.yml

FROM docker.io/nginx

COPY --from=builder /antora/gh-pages/ /usr/share/nginx/html/

EXPOSE 80