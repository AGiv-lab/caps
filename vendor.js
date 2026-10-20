const events = require('./caps');
const { randomUUID } = require('crypto');

const store = '1-206-flowers';

function createOrder(storeName = store) { 
  const order = {
  store: storeName,  
    orderId: randomUUID(),
    customer: 'Jane Doe',
    address: 'Seattle, WA',
  };

  console.log(`New order: ${order.orderId}`);
  events.emit('pickup', order);

  return order;
}

events.on('delivered', (order) => {
  if (order.store === store) {
    console.log(`Thank you for your order, ${order.customer}`);
  }
});

module.exports = { createOrder }; 