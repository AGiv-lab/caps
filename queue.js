// Store pending messages by event and client.
const queues = new Map();

function saveMessage(event, clientId, messageId, payload) {
  const key = `${event}:${clientId}`;

  if (!queues.has(key)) {
    queues.set(key, new Map());
  }

  queues.get(key).set(messageId, payload);
}

function getAll(event, clientId) {
  const key = `${event}:${clientId}`;

  if (!queues.has(key)) {
    return [];
  }

  return Array.from(queues.get(key), ([messageId, payload]) => ({
    messageId,
    payload,
  }));
}

function received(event, clientId, messageId) {
  const key = `${event}:${clientId}`;

  if (!queues.has(key)) {
    return false;
  }

  return queues.get(key).delete(messageId);
}

module.exports = {
  saveMessage,
  getAll,
  received,
};
