FROM golang:latest

WORKDIR /flake_api

# copy all your .go source files
# (or use a .dockerignore and COPY . .)
COPY *.go .

COPY /pb_data /pb_data

# remove any previously initialized go.mod and go.sum files
# (this is in case the container data wasn't destroyed)
RUN rm -f go.mod rm go.sum

# initialize Go modules
RUN go mod init app

# fetch dependencies
RUN go mod tidy

# build (switch to 1 to use the CGO SQLite)
RUN CGO_ENABLED=0 go build -o /pocketbase

# export listener port
EXPOSE 8090

# run
# (ps. don't forget to mount the pb_data as volume in /pb_data)
CMD ["/pocketbase", "serve", "--http=0.0.0.0:8090"]