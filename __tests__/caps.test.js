// Mock both packages before loading the app so no network connections open.
jest.mock('socket.io-client', () => ({ io: jest.fn() }));
jest.mock('socket.io', () => ({ Server: jest.fn() }));

describe('CAPS Socket.IO event handlers', () => {
  let socket;
  let handlers;
  let caps;
  let room;
  let connectionHandler;
  let logSpy;

  const order = {
   store: '1-800-flowers',
    orderId: 'test-123',
    customer: 'Jane Doe',
    address: 'Seattle, WA',
  };

  beforeEach(() => {
    // Reload modules so each test gets its own handlers and vendor timer.
    jest.resetModules();
    jest.useFakeTimers();
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    handlers = {};
    socket = {
      id: 'test-socket',
      // Save callbacks so tests can simulate incoming events directly.
      on: jest.fn((event, handler) => {
        handlers[event] = handler;
      }),
      emit: jest.fn(),
      join: jest.fn(),
      broadcast: { emit: jest.fn() },
    };

    room = { emit: jest.fn() };
    connectionHandler = undefined;
    caps = {
      on: jest.fn((event, handler) => {
        if (event === 'connection') connectionHandler = handler;
      }),
      to: jest.fn(() => room),
    };

    require('socket.io-client').io.mockReturnValue(socket);
    require('socket.io').Server.mockImplementation(() => ({
      of: jest.fn(() => caps),
    }));
  });

  afterEach(() => {
    // Discard repeating timers instead of trying to run them forever.
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  function connectServerClient() {
    require('../socket-server');
    connectionHandler(socket);
  }

  function expectEventLog(event) {
    expect(logSpy).toHaveBeenCalledWith('EVENT:', {
      event,
      time: new Date().toISOString(),
      payload: order,
    });
  }

  test('vendor creates an order, logs it, and emits pickup', () => {
    const { createOrder } = require('../vendor');
    const createdOrder = createOrder();

    expect(require('socket.io-client').io)
      .toHaveBeenCalledWith('http://localhost:3000/caps');
    expect(createdOrder).toEqual({
      store: order.store,
      orderId: expect.any(String),
      customer: order.customer,
      address: order.address,
    });
    expect(createdOrder.orderId).not.toBe('');
    expect(logSpy).toHaveBeenCalledWith(`New order: ${createdOrder.orderId}`);
    expect(socket.emit).toHaveBeenCalledWith('pickup', createdOrder);
  });

  test('vendor joins on connection and schedules orders without duplicate timers', () => {
    require('../vendor');
    expect(jest.getTimerCount()).toBe(0);

    handlers.connect();
    expect(socket.emit).toHaveBeenCalledWith('join', order.store);
    jest.advanceTimersByTime(4999);
    expect(socket.emit).not.toHaveBeenCalledWith('pickup', expect.anything());

    jest.advanceTimersByTime(1);
    expect(socket.emit.mock.calls.filter(([event]) => event === 'pickup'))
      .toHaveLength(1);

    // A reconnect should rejoin the store, but keep the existing schedule.
    handlers.connect();
    expect(socket.emit.mock.calls.filter(([event]) => event === 'join'))
      .toHaveLength(2);
    expect(jest.getTimerCount()).toBe(1);
    jest.advanceTimersByTime(5000);
    expect(socket.emit.mock.calls.filter(([event]) => event === 'pickup'))
      .toHaveLength(2);
  });

  test('vendor thanks its customer and ignores another store delivery', () => {
    require('../vendor');

    handlers.delivered(order);
    expect(logSpy).toHaveBeenCalledWith('Thank you for your order, Jane Doe');

    logSpy.mockClear();
    handlers.delivered({ ...order, store: 'another-store' });
    expect(logSpy).not.toHaveBeenCalled();
  });

  test('driver logs pickup and emits status updates with a two-second delivery delay', () => {
    const { handlePickup } = require('../driver');
    expect(require('socket.io-client').io)
      .toHaveBeenCalledWith('http://localhost:3000/caps');
    expect(socket.on).toHaveBeenCalledWith('pickup', handlePickup);

    handlers.pickup(order);
    expect(logSpy).toHaveBeenCalledWith(`DRIVER: picked up ${order.orderId}`);
    expect(socket.emit).toHaveBeenCalledWith('in-transit', order);
    expect(socket.emit).toHaveBeenCalledTimes(2);

    jest.advanceTimersByTime(1999);
    expect(socket.emit).not.toHaveBeenCalledWith('delivered', order);
    expect(logSpy).not.toHaveBeenCalledWith(`DRIVER: delivered ${order.orderId}`);

    jest.advanceTimersByTime(1);
    expect(logSpy).toHaveBeenCalledWith(`DRIVER: delivered ${order.orderId}`);
    expect(socket.emit).toHaveBeenCalledWith('delivered', order);
    expect(socket.emit).toHaveBeenCalledTimes(3);
  });

  test('server logs a connection and registers client handlers', () => {
    connectServerClient();

    expect(require('socket.io').Server).toHaveBeenCalledWith(3000);
    expect(logSpy).toHaveBeenCalledWith('CAPS: Client connected test-socket');
    for (const event of ['join', 'pickup', 'in-transit', 'delivered']) {
      expect(socket.on).toHaveBeenCalledWith(event, expect.any(Function));
    }
  });

  test('server joins the requested store room and logs the join', () => {
    connectServerClient();
    handlers.join(order.store);

    expect(socket.join).toHaveBeenCalledWith(order.store);
    expect(logSpy).toHaveBeenCalledWith(`CAPS: test-socket joined ${order.store}`);
  });

  test('server logs and broadcasts pickup with the unchanged order', () => {
    connectServerClient();
    handlers.pickup(order);

    expectEventLog('pickup');
    expect(socket.broadcast.emit).toHaveBeenCalledWith('pickup', order);
  });

  // Each row is a separate test for a store-specific status handler.
  test.each(['in-transit', 'delivered'])(
    'server logs %s and forwards it to the order store room',
    (event) => {
      connectServerClient();
      handlers[event](order);

      expectEventLog(event);
      expect(caps.to).toHaveBeenCalledWith(order.store);
      expect(room.emit).toHaveBeenCalledWith(event, order);
    },
  );
});
