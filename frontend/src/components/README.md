# Chat Component Structure

This document describes the refactored chat component structure that breaks down the monolithic ChatContainer into smaller, more maintainable components.

## Component Structure

### Main Components

1. **ChatContainer.jsx** - Main container component that acts as a wrapper
2. **ChatPanel.jsx** - Core chat panel that orchestrates all sub-components
3. **ChatHeader.jsx** - Header component showing friend info and online status
4. **MessageList.jsx** - Container for all messages with auto-scroll functionality
5. **Message.jsx** - Individual message component with styling logic
6. **MessageInput.jsx** - Input component for typing and sending messages
7. **EmptyChat.jsx** - Placeholder component when no chat is selected

### Utility Files

#### `utils/chatUtils.js`
Contains utility functions for:
- Message formatting and time display
- Message alignment and styling logic
- Content processing
- Avatar source determination
- Message validation

#### `constants/chatConstants.js`
Contains styling and configuration constants:
- Chat styling constants (colors, sizes, backgrounds)
- Message styling constants
- Icon sizes and spacing values
- Z-index values

### Custom Hooks

#### `hooks/useChatInput.js`
Custom hook for managing chat input functionality:
- Message state management
- Send message logic
- Input validation
- Message clearing

#### `hooks/useAutoScroll.js`
Custom hook for auto-scrolling to latest messages:
- Automatic scroll to bottom when new messages arrive
- Smooth scrolling behavior

## File Organization

```
src/
├── components/
│   ├── ChatContainer.jsx      # Main wrapper component
│   ├── ChatPanel.jsx          # Core chat panel
│   ├── ChatHeader.jsx         # Header with user info
│   ├── MessageList.jsx        # Messages container
│   ├── Message.jsx            # Individual message
│   ├── MessageInput.jsx       # Input component
│   ├── EmptyChat.jsx          # Empty state component
│   └── index.js               # Component exports
├── utils/
│   ├── chatUtils.js           # Chat utility functions
│   ├── propTypes.js           # PropTypes definitions
│   └── index.js               # Utility exports
├── hooks/
│   ├── useChatInput.js        # Chat input hook
│   ├── useAutoScroll.js       # Auto-scroll hook
│   └── index.js               # Hook exports
└── constants/
    ├── chatConstants.js       # UI constants
    └── index.js               # Constants exports
```

## Benefits of This Structure

1. **Separation of Concerns**: Each component has a single responsibility
2. **Reusability**: Components can be easily reused in other parts of the app
3. **Maintainability**: Smaller components are easier to understand and modify
4. **Testability**: Individual components can be tested in isolation
5. **Consistency**: Constants ensure consistent styling across components
6. **Code Organization**: Related functionality is grouped together

## Usage Example

```jsx
import { ChatContainer } from './components';

// Use ChatContainer as before - the API remains the same
<ChatContainer
  messages={messages}
  user={user}
  currChat={currChat}
  currFriend={currFriend}
  setMessages={setMessages}
  isOnline={isOnline}
  send={send}
  small={small}
  handleBack={handleBack}
/>
```

## Component Props

### ChatPanel Props
- `messages`: Array of message objects
- `user`: Current user object
- `currChat`: Current chat ID
- `currFriend`: Current friend object
- `setMessages`: Function to update messages
- `isOnline`: Function to check online status
- `send`: Function to send messages
- `small`: Boolean for mobile layout
- `handleBack`: Function for back navigation

### Message Props
- `message`: Message object
- `user`: Current user object

### ChatHeader Props
- `currFriend`: Current friend object
- `isOnline`: Function to check online status
- `small`: Boolean for mobile layout
- `handleBack`: Function for back navigation

### MessageInput Props
- `user`: Current user object
- `currChat`: Current chat ID
- `setMessages`: Function to update messages
- `send`: Function to send messages

## Styling

All styling constants are centralized in `constants/chatConstants.js` to ensure consistency and make theme changes easier. Components import these constants instead of using hardcoded values.

## Custom Hooks

The custom hooks encapsulate common functionality that can be reused across components:

- `useChatInput`: Manages message input state and validation
- `useAutoScroll`: Handles automatic scrolling to new messages

This structure makes the code more modular, maintainable, and follows React best practices for component composition.
