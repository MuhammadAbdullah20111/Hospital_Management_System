import ZKLib from 'node-zklib';

async function test() {
  const ip = '192.168.1.100';
  const port = 4370;
  console.log(`Connecting to ${ip}:${port}...`);
  const zkInstance = new ZKLib(ip, port, 10000, 4000);
  try {
    await zkInstance.createSocket();
    console.log('Socket created successfully.');
    
    try {
      const info = await zkInstance.getInfo();
      console.log('Device info:', info);
    } catch (infoErr) {
      console.log('Failed to get device info:', infoErr.message);
    }
    
    const response = await zkInstance.getAttendances();
    console.log('Response structure:', {
      hasResponse: !!response,
      keys: response ? Object.keys(response) : null,
      err: response && response.err ? response.err.message : null,
      dataLength: response && response.data ? response.data.length : null
    });
    
    if (response && response.data && response.data.length > 0) {
      console.log('First 5 logs sample:', response.data.slice(0, 5));
    }
    
    await zkInstance.disconnect();
    console.log('Disconnected.');
  } catch (err) {
    console.error('Error during testing:', err);
  }
}

test();
