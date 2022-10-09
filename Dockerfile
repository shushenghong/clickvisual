# UI build stage
FROM node:16-alpine3.14 as js-builder

ENV NODE_OPTIONS="--max_old_space_size=8000"
# 部署在子路径clickvisual下
ENV PUBLIC_PATH="/clickvisual/"
WORKDIR /clickvisual
COPY ui/package.json ui/yarn.lock ./

RUN npm config set registry http://registry.npm.taobao.org
RUN yarn config set registry https://registry.npm.taobao.org
RUN yarn install --frozen-lockfile --network-timeout 100000
ENV NODE_ENV production
COPY ui .
RUN yarn build


# API build stage
FROM golang:1.18.6-alpine3.16 as go-builder
ARG GOPROXY=goproxy.cn
ARG TARGETOS
ARG TARGETARCH

ENV GOPROXY=https://${GOPROXY},direct
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories
RUN apk add --no-cache make bash git tzdata

WORKDIR /clickvisual

COPY go.mod go.sum ./
RUN go mod download -x
COPY scripts scripts
COPY api api
COPY config config
COPY Makefile Makefile
COPY --from=js-builder /clickvisual/dist ./api/internal/ui/dist
RUN ls -rlt ./api/internal/ui/dist
RUN CGO_ENABLED=0 GOOS=$TARGETOS GOARCH=$TARGETARCH go build -o ./bin/clickvisual ./api/main.go


# Fianl running stage
FROM alpine:3.14.3
LABEL maintainer="clickvisual@shimo.im"

WORKDIR /clickvisual

COPY --from=go-builder /clickvisual/bin/clickvisual ./bin/
COPY --from=go-builder /clickvisual/config ./config

EXPOSE 9001
EXPOSE 9003

RUN apk add --no-cache tzdata

CMD ["sh", "-c", "./bin/clickvisual"]
