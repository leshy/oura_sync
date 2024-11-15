FROM denoland/deno:2.0.6

WORKDIR /app

# Prefer not to run as root.

# These steps will be re-run upon each file change in your working directory:
COPY . .
RUN deno install
RUN deno cache ouraSync.ts

CMD ["run", "-A", "ouraSync.ts"]
