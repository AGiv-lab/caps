const events = require('./caps');

// Start the driver and vendor event listeners
require('./driver');
const { createOrder } = require('./vendor');

 
// Log every event with its timestamp and complete payload
function logEvent(event, payload) {
  console.log('EVENT:', {
    event,
    time: new Date().toISOString(),
    payload,
  });
}

events.on('pickup', (order) => {
  logEvent('pickup', order);
});

events.on('in-transit', (order) => {
  logEvent('in-transit', order);
});

events.on('delivered', (order) => {
  logEvent('delivered', order);
});

createOrder();
setInterval(createOrder, 5000); 