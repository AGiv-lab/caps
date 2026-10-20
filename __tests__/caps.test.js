const events = require('../caps');
const { createOrder } = require('../vendor');
const { handlePickup } = require('../driver');

describe('CAPS Event System', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  test('vendor creates an order with required fields', () => {
    jest.useFakeTimers();
    const emitSpy = jest.spyOn(events, 'emit');

    const order = createOrder();

    expect(order.store).toBe('1-206-flowers');
    expect(order.orderId).toBeDefined();
    expect(order.customer).toBeDefined();
    expect(order.address).toBeDefined();
    expect(emitSpy).toHaveBeenCalledWith('pickup', order);
    jest.runAllTimers();
  });

  test('driver emits in-transit and delivered events', () => {
    jest.useFakeTimers();

    const emitSpy = jest.spyOn(events, 'emit');
    const order = {
      store: '1-206-flowers',
      orderId: 'test-123',
      customer: 'Jane Doe',
      address: 'Seattle, WA',
    };

    handlePickup(order);

       expect(emitSpy).toHaveBeenCalledWith('in-transit', order);

    jest.advanceTimersByTime(2000);

    expect(emitSpy).toHaveBeenCalledWith('delivered', order);
  });

  test('vendor thanks the customer when an order is delivered', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const order = {
      store: '1-206-flowers',
      orderId: 'test-456',
      customer: 'Jane Doe',
      address: 'Seattle, WA',
    };

    events.emit('delivered', order);

    expect(logSpy).toHaveBeenCalledWith(
      'Thank you for your order, Jane Doe'
    );
  });

  
  test('driver logs pickup and delivery confirmations', () => {
    jest.useFakeTimers();
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const order = {
      store: '1-206-flowers',
      orderId: 'test-789',
      customer: 'Jane Doe',
      address: 'Seattle, WA',
    };

    handlePickup(order);

    expect(logSpy).toHaveBeenCalledWith(
      'DRIVER: picked up test-789'
    );

    jest.advanceTimersByTime(2000);

    expect(logSpy).toHaveBeenCalledWith(
      'DRIVER: delivered test-789'
    );
  });

});