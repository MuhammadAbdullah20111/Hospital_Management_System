import ZKLib from 'zk-attendance-sdk';
import prisma from '../config/prismaClient.js';

async function inspectLogs() {
  console.log('🔍 Querying active biometric devices from database...');
  const devices = await prisma.biometricDevice.findMany({ where: { isActive: true } });
  
  if (devices.length === 0) {
    console.log('❌ No active biometric devices found in database.');
    process.exit(1);
  }

  const device = devices[0];
  console.log(`📡 Connecting to device: ${device.name} (${device.ipAddress}:${device.port})...`);
  
  const zkInstance = new ZKLib(device.ipAddress, device.port, 10000, 4000);
  try {
    await zkInstance.createSocket();
    console.log('✅ Connected. Fetching attendance logs...');
    const response = await zkInstance.getAttendances();
    await zkInstance.disconnect();
    
    if (response && response.err) {
      throw response.err;
    }
    
    const logs = response && response.data ? response.data : [];
    console.log(`📊 Total logs on device: ${logs.length}`);
    
    if (logs.length > 0) {
      // Sort logs by timestamp/recordTime descending to see the latest
      const sortedLogs = [...logs].sort((a, b) => {
        const tA = new Date(a.timestamp || a.recordTime);
        const tB = new Date(b.timestamp || b.recordTime);
        return tB - tA;
      });
      
      console.log('\n📅 Latest 10 raw logs from device:');
      sortedLogs.slice(0, 10).forEach((l, idx) => {
        const rawTimeStr = l.timestamp || l.recordTime;
        const parsedDate = new Date(rawTimeStr);
        console.log(`[${idx + 1}] User PIN: ${l.deviceUserId || l.userId || l.userPin}, Raw Time: ${rawTimeStr}, Parsed Date Object (UTC): ${parsedDate.toISOString()}, Local String: ${parsedDate.toString()}`);
      });
      
      const serverTime = new Date();
      console.log(`\n🕒 Current Server Time (UTC): ${serverTime.toISOString()}`);
      console.log(`🕒 Current Server Time (Local): ${serverTime.toString()}`);
      console.log(`🕒 Server 24h cutoff threshold: ${new Date(serverTime.getTime() - 24 * 60 * 60 * 1000).toISOString()}`);
    } else {
      console.log('No logs found on device.');
    }
  } catch (error) {
    console.error('❌ Failed to communicate with biometric device:', error.message);
  }
  process.exit(0);
}

inspectLogs();
