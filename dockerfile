# ------------------------------------------------------------------------------
# Frontend base
# ------------------------------------------------------------------------------
FROM node:24-slim AS frontend-base

ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}/bin:${PATH}"

RUN corepack enable

WORKDIR /app

COPY front/ .

# ------------------------------------------------------------------------------
# Frontend build
# ------------------------------------------------------------------------------
FROM frontend-base AS frontend-builder

RUN --mount=type=cache,id=frontend-pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

RUN pnpm run build


# ------------------------------------------------------------------------------
# Backend build
# ------------------------------------------------------------------------------
FROM golang:1.26-bookworm AS backend-builder


WORKDIR /app


# Dependencies
COPY go.mod go.sum ./


RUN go mod download


# Source
COPY internal/ internal/
COPY cmd/ cmd/

RUN rm -rf ./internal/infra/http/static/dist

# Frontend static assets
COPY --from=frontend-builder \
    /app/dist \
    ./internal/infra/http/static/dist


# Build binary
RUN CGO_ENABLED=1 \
    GOOS=linux \
    go build \
    -trimpath \
    -ldflags="-s -w" \
    -o /app/server \
    ./cmd/server

RUN CGO_ENABLED=1 \
    GOOS=linux \
    go build \
    -trimpath \
    -ldflags="-s -w" \
    -o /app/ratingimporter \
    ./cmd/importer


# ------------------------------------------------------------------------------
# Runtime image
# ------------------------------------------------------------------------------
FROM gcr.io/distroless/cc-debian12

WORKDIR /app

ENV ENV=production
ENV TZ=Europe/London
ENV HOME=/tmp

COPY --from=backend-builder /app/server /app/server
COPY --from=backend-builder /app/ratingimporter /app/ratingimporter

USER nonroot:nonroot

EXPOSE 8080

ENTRYPOINT ["/app/server"]
