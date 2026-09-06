# Backend Application

## Local Development: MongoDB Atlas IP Auto-Whitelisting

Because MongoDB Atlas restricts connections by IP address, developing locally from different WiFi networks means your public IP frequently changes. To prevent having to manually whitelist your IP via the Atlas dashboard every time, this project includes a script (`scripts/whitelist-ip.ts`) that runs automatically before `npm run start:dev`.

### Setup Instructions (For Local Dev ONLY)

1. Go to the [MongoDB Atlas Dashboard](https://cloud.mongodb.com/).
2. Navigate to **Access Manager** -> **Project Access** -> **API Keys**.
3. Create a new API Key with the **"Project IP Access List Admin"** permission.
4. Copy the Public Key, Private Key, and your Project ID.
5. Add them to your local `b2-backend/.env` file:
   ```env
   ATLAS_PUBLIC_KEY=your_public_key
   ATLAS_PRIVATE_KEY=your_private_key
   ATLAS_PROJECT_ID=your_project_id
   ```

**⚠️ SECURITY WARNING:** Never commit your `.env` file or your Atlas API keys. This setup is strictly for local development environments. 

### How it Works
When you run `npm run dev` or `npm run start:dev`, the `prestart:dev` script will trigger:
1. It fetches your current public IP address.
2. It calls the Atlas Admin API v2 to add your IP to the access list with a comment (`auto-added by [hostname] dev script`).
3. If the environment variables are missing, the script gracefully skips this step so it won't break the workflow for CI or teammates without API keys.

### Atlas CLI Alternative
If you prefer not to use the automated script, you can use the MongoDB Atlas CLI to whitelist your IP with a single command:
```bash
atlas accessLists create --currentIp --projectId <PROJECT_ID>
```
