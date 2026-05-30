# Cloudflare deployment

This app is prepared for Cloudflare Pages with a D1-backed beta signup endpoint.

## After creating a Cloudflare account

1. Log in:

   ```sh
   npx wrangler login
   ```

2. Create the D1 database:

   ```sh
   npx wrangler d1 create 3daide
   ```

3. Copy the returned `database_id` into `wrangler.toml` for both `database_id` and `preview_database_id`.

4. Apply the D1 migration:

   ```sh
   npm run d1:migrate:remote
   ```

5. Build and deploy:

   ```sh
   npm run pages:build
   npm run pages:deploy
   ```

## Read submitted emails

```sh
npm run d1:list:remote
```
