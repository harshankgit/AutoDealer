// Mock Pusher implementation
class PusherMock {
  trigger(channel: string, event: string, data: any) {
    // In a real implementation, this would send data to Pusher
    console.log(`Pusher mock: Triggering "${event}" on channel "${channel}" with data:`, data);
    return Promise.resolve();
  }
}

let pusher: any;

if (process.env.NODE_ENV === 'production') {
  // In production, attempt to use real Pusher if available
  try {
    const PusherServer = require('pusher');
    pusher = new PusherServer({
      appId: process.env.PUSHER_APPid!,
      key: process.env.PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.PUSHER_CLUSTER!,
      useTLS: true,
    });
  } catch (error) {
    console.warn('Pusher not available, using mock implementation:', error);
    pusher = new PusherMock();
  }
} else {
  // In development, use the mock implementation unless pusher is installed
  try {
    const PusherServer = require('pusher');
    pusher = new PusherServer({
      appId: process.env.PUSHER_APPid!,
      key: process.env.PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.PUSHER_CLUSTER!,
      useTLS: true,
    });
  } catch (error) {
    console.warn('Pusher not installed, using mock implementation');
    pusher = new PusherMock();
  }
}

export default pusher;