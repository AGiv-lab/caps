const { io } = require('socket.io-client');

// Lab 12: connect to the CAPS server instead of a local EventEmitter.
const socket = io('http://localhost:3000/caps');

socket.on('connect', () => {
  socket.emit('getAll', {
    event: 'pickup',
    clientId: 'drivers',
  });
});

function handlePickup(order) {
  console.log(`DRIVER: picked up ${order.orderId}`);

    socket.emit('received', {
    event: 'pickup',
    clientId: 'drivers',
    messageId: order.messageId || order.orderId,
  });

  // Tell the server immediately that the package is in transit.
  socket.emit('in-transit', order);

  setTimeout(() => {
    console.log(`DRIVER: delivered ${order.orderId}`);

    // Tell the server delivery is complete after two seconds.
    socket.emit('delivered', order);
  }, 2000);
}

// Receive pickup requests forwarded by the CAPS server.
socket.on('pickup', handlePickup);

module.exports = { handlePickup };
