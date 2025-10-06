## Redis

mkdir -p ./redis-data
docker run -d --name redis-stack \
  -p 6379:6379 -p 8001:8001 \
  -v $(pwd)/redis-data:/data \
  redis/redis-stack:latest