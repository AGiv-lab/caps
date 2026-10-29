const { io } = require('socket.io-client');
const { randomUUID } = require('crypto');

const store = process.env.STORE || '1-800-flowers';

// Lab 12: connect to the CAPS server instead of a local EventEmitter.
const socket = io('http://localhost:3000/caps');

// Keep one order timer so reconnecting does not create extra schedules.
let orderInterval;

socket.on('connect', () => {
  // Join this store's room to receive its delivery updates.
  socket.emit('join', store);
    socket.emit('getAll', {
    event: 'delivered',
    clientId: store,
  });

  if (!orderInterval) {
    // Lab 11 scheduled orders in index.js.
    // Lab 12 runs the vendor separately and starts orders after connecting.
    orderInterval = setInterval(createOrder, 5000);
  }
});

function createOrder(storeName = store) {
  const order = {
    store: storeName,
    orderId: randomUUID(),
    customer: 'Jane Doe',
    address: 'Seattle, WA',
  };

  console.log(`New order: ${order.orderId}`);
  // Send the pickup to the server, which forwards it to other clients.
  socket.emit('pickup', order);

  return order;
}

// Receive delivery confirmations through the CAPS server.
socket.on('delivered', (order) => {
  if (order.store === store) {
    console.log(`Thank you for your order, ${order.customer}`);

    socket.emit('received', {
      event: 'delivered',
      clientId: store,
      messageId: order.messageId || order.orderId,
    });
  }
});

module.exports = { createOrder };
