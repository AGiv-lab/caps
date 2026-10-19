# CAPS — Code Academy Parcel Service

## Lab 11: Event-Driven Applications (Phase 1)

CAPS is a simulated package delivery tracking system built using Node.js and EventEmitter.

The application uses events to communicate between a vendor, driver, and central CAPS event hub.

## UML Diagram

![CAPS Phase 1 UML](assets/caps-uml.png)

## Technologies

- JavaScript
- Node.js
- EventEmitter
- Jest

## Application Structure

| File | Purpose |
|---|---|
| `caps.js` | Shared EventEmitter instance |
| `vendor.js` | Creates orders and listens for delivery confirmations |
| `driver.js` | Handles pickups and simulates deliveries |
| `index.js` | Starts the application and logs events |
| `__tests__/caps.test.js` | Jest tests |

## Event Workflow

1. Vendor creates an order.
2. Vendor emits `pickup`.
3. Driver receives the pickup event.
4. Driver emits `in-transit`.
5. Driver simulates delivery after two seconds.
6. Driver emits `delivered`.
7. Vendor receives confirmation and thanks the customer.

A new order is generated every five seconds.

## Installation

```bash
npm install
```

## Run Application

```bash
node index.js
```

Press `Ctrl + C` to stop the simulation.

## Testing

```bash
npm test -- --runInBand
```

The Jest tests verify that:

- Vendor orders contain the required fields.
- Pickup events are emitted.
- Driver in-transit and delivered events are emitted.

**Current results:** 2 tests passing.

## AI Assistance Disclosure

ChatGPT was used to assist with the implementation and testing of this lab.

**Prompts used (representative excerpts from the development conversation):**

- "Continue Lab 11 manually in VS Code and terminal, one step at a time."
- "can you please say unbuntu bash or vs code terminal to differientiate where i should input"
- "my instructor gave me the fork to utilize so please try to hurry this along"

**AI contributions:**

- Suggested the EventEmitter-based application structure.
- Generated initial vendor, driver, and application entry-point code.
- Generated Jest tests using spies and fake timers.
- Helped troubleshoot npm installation, JSON syntax, and asynchronous Jest warnings.
- Assisted with README documentation.

All application behavior was tested locally using Node.js and Jest.

## Future Development

Lab 12 will replace the local EventEmitter communication with Socket.io to support communication over a network. 