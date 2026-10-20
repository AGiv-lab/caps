const events = require('./caps');

function handlePickup(order) {
  console.log(`DRIVER: picked up ${order.orderId}`);

  events.emit('in-transit', order);

  setTimeout(() => {
    console.log(`DRIVER: delivered ${order.orderId}`);
    events.emit('delivered', order);
  }, 2000);
}

events.on('pickup', handlePickup);

module.exports = { handlePickup };
