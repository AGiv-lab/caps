
const { Server } = require('socket.io');

const io = new Server(3000);
const caps = io.of('/caps');

caps.on('connection', (socket) => {
  console.log(`CAPS: Client connected ${socket.id}`);

  socket.on('join', (store) => {
    socket.join(store);
    console.log(`CAPS: ${socket.id} joined ${store}`);
  });

  socket.on('pickup', (order) => {
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
    console.log('EVENT:', {
      event: 'delivered',
      time: new Date().toISOString(),
      payload: order,
    });

    caps.to(order.store).emit('delivered', order);
  });
});

console.log('CAPS Socket.io server listening on port 3000');
