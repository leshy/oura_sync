# OURA -> INFLUXDB sync

## Quick start

### Docker
```sh
docker run \
 -e OURASYNC_OURA_TOKEN=$(pass oura/token) \
 -e OURASYNC_INFLUXDB_TOKEN=$(pass influxdb/token) \
 -e OURASYNC_INFLUXDB_URL="http://influxdbhost:8086" \
 -e OURASYNC_INFLUXDB_ORG="org" \
 -e OURASYNC_INFLUXDB_BUCKET="bucket" \
 -it lesh/ourasync
```

### Local

install deno (https://docs.deno.com/runtime/)

```sh
git clone git@github.com:leshy/oura_sync.git
cd oura_sync
deno install
deno run main.ts
```sh

## Details

- You'll need to be familiar with influxdb (+ grafana for graphing)

- Create your oura token at https://cloud.ouraring.com/personal-access-tokens

- The way this works is it reads the latest point's time of an influxdb measuremnet, then queries Oura API from that point onwards and writes the data to influxdb. measurement names are hardcoded, check [ouraSync.ts](./ouraSync.ts) file

- data transforms from [Oura Api](https://cloud.ouraring.com/v2/docs) to Influxdb are defined at [ouraSync.ts](./ouraSync.ts) file, should be quite straightforward to modify if needed. 

# Grafana
![grafana dashboard](./misc/dashboard.png)

my quick dashboard [.json export is here](./misc/grafana_dashboard.json)
