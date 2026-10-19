const events = require('./caps');

// Start the driver and vendor event listeners
require('./driver');
const { createOrder } = require('./vendor');

// Log events at the CAPS hub
events.on('pickup', (order) => {
  console.log(`CAPS: pickup requested for ${order.orderId}`);
});

events.on('in-transit', (order) => {
  console.log(`CAPS: package ${order.orderId} is in transit`);
});

events.on('delivered', (order) => {
  console.log(`CAPS: package ${order.orderId} delivered`);
});

// Generate an order every 5 seconds
createOrder();
setInterval(createOrder, 5000); 