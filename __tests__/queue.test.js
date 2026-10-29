const { saveMessage, getAll, received } = require('../queue');

describe('CAPS Message Queue', () => {
  test('saves and retrieves a pending pickup message', () => {
    const order = {
      orderId: 'order-001',
      store: '1-800-flowers',
    };

    saveMessage('pickup', 'drivers', 'msg-001', order);

    expect(getAll('pickup', 'drivers')).toEqual([
      {
        messageId: 'msg-001',
        payload: order,
      },
    ]);
  });
});