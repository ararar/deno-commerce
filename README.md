# deno-commerce

deno opensource ecommerce platform and point of sale features

### Steps

Make sure `deno` and `docker` are installed

```sh
# copy env
cp .env.example .env

# start mysql
docker-compose up

# start the server
make start

# check formatting
make fmt

# unit test
make test
```

### Available endpoints

1. Admin interface: `/admin`
2. Products section: `/products` and `/admin/products`
3. Plugins
  a. Sample plugin `/plugin-one`

### Developers

1. Project follows `git-flow`
