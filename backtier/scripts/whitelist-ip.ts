import { request } from 'urllib';
import * as os from 'os';
import * as dotenv from 'dotenv';

dotenv.config();

const { ATLAS_PUBLIC_KEY, ATLAS_PRIVATE_KEY, ATLAS_PROJECT_ID } = process.env;

async function whitelistIp() {
  if (!ATLAS_PUBLIC_KEY || !ATLAS_PRIVATE_KEY || !ATLAS_PROJECT_ID) {
    console.log(
      '⚠️  Atlas environment variables (ATLAS_PUBLIC_KEY, ATLAS_PRIVATE_KEY, ATLAS_PROJECT_ID) not found. Skipping IP whitelisting.'
    );
    return;
  }

  try {
    // 1. Fetch current public IP
    console.log('Fetching current public IP...');
    const ipResponse = await request('https://api.ipify.org?format=json', {
      dataType: 'json',
    });
    const currentIp = ipResponse.data.ip;

    if (!currentIp) {
      throw new Error('Could not determine public IP');
    }

    console.log(`Current public IP: ${currentIp}`);

    // 2. Call MongoDB Atlas API to whitelist
    console.log(`Adding ${currentIp} to Atlas project ${ATLAS_PROJECT_ID}...`);
    
    const url = `https://cloud.mongodb.com/api/atlas/v2/groups/${ATLAS_PROJECT_ID}/accessList`;
    const hostname = os.hostname();
    const payload = [
      {
        ipAddress: currentIp,
        comment: `auto-added by ${hostname} dev script`,
      },
    ];

    const atlasResponse = await request(url, {
      method: 'POST',
      digestAuth: `${ATLAS_PUBLIC_KEY}:${ATLAS_PRIVATE_KEY}`,
      data: payload,
      contentType: 'application/json',
      headers: {
        Accept: 'application/vnd.atlas.2023-01-01+json',
      },
      dataType: 'json',
    });

    if (atlasResponse.status >= 200 && atlasResponse.status < 300) {
      console.log(`✅ Successfully whitelisted ${currentIp} on MongoDB Atlas.`);
    } else {
      console.error(
        `❌ Failed to whitelist IP. Status: ${atlasResponse.status}`,
        atlasResponse.data
      );
    }
  } catch (error) {
    console.error('❌ Error during Atlas IP whitelisting:', error);
  }
}

whitelistIp();
