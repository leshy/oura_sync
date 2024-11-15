# OURA -> INFLUXDB sync

```sh
docker run \
 -e OURASYNC_OURA_TOKEN=$(pass oura/token) \
 -e OURASYNC_INFLUXDB_TOKEN=$(pass influxdb/token) \
 -e OURASYNC_INFLUXDB_URL="http://influxdbhost:8086" \
 -e OURASYNC_INFLUXDB_ORG="org" \
 -e OURASYNC_INFLUXDB_BUCKET="bucket" \
 -it lesh/ourasync
```
# Data format
data transforms from [Oura Api](https://cloud.ouraring.com/v2/docs) to Influxdb are defined at [ouraSync.ts](./ouraSync.ts) file, should be quite straightforward to modify.

# Grafana
![grafana dashboard](./misc/dashboard.png)

my quick dashboard [.json export is here](./misc/grafana_dashboard.json)
