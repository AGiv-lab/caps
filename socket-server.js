const { Server } = require('socket.io');
const { saveMessage, getAll, received } = require('./queue');

const io = new Server(3000);
const caps = io.of('/caps');

caps.on('connection', (socket) => {
  console.log(`CAPS: Client connected ${socket.id}`);

  socket.on('join', (store) => {
    socket.join(store);
    console.log(`CAPS: ${socket.id} joined ${store}`);
  });

  socket.on('getAll', ({ event, clientId }) => {
    if (
      (event !== 'pickup' || clientId !== 'drivers') &&
      (event !== 'delivered' || !socket.rooms.has(clientId))
    ) {
      return;
    }

    const messages = getAll(event, clientId);

    messages.forEach(({ messageId, payload }) => {
      socket.emit(event, { ...payload, messageId });
    });
  });

  socket.on('received', ({ event, clientId, messageId }) => {
    if (
      (event !== 'pickup' || clientId !== 'drivers') &&
      (event !== 'delivered' || !socket.rooms.has(clientId))
    ) {
      return;
    }

    received(event, clientId, messageId);
  });

  socket.on('pickup', (order) => {
    saveMessage('pickup', 'drivers', order.orderId, order);

    console.log('EVENT:', {
      event: 'pickup',
      time: new Date().toISOString(),
      payload: order,
    });

    socket.broadcast.emit('pickup', order);
  });

  socket.on('in-transit', (order) => {
    console.log('EVENT:', {
      event: 'in-transit',
      time: new Date().toISOString(),
      payload: order,
    });

    caps.to(order.store).emit('in-transit', order);
  });

  socket.on('delivered', (order) => {
    saveMessage('delivered', order.store, order.orderId, order);
    console.log('EVENT:', {
      event: 'delivered',
      time: new Date().toISOString(),
      payload: order,
    });

    caps.to(order.store).emit('delivered', order);
  });
});

console.log('CAPS Socket.io server listening on port 3000');
