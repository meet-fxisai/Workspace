import PropTypes from 'prop-types';

// User object shape
export const UserPropType = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  firstName: PropTypes.string.isRequired,
  lastName: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  gender: PropTypes.oneOf(['Male', 'Female']),
});

// Message object shape
export const MessagePropType = PropTypes.shape({
  content: PropTypes.string.isRequired,
  authorId: PropTypes.string, // null for system messages
  chatId: PropTypes.string.isRequired,
  createdAt: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date),
  ]).isRequired,
});

// Friend object shape (same as User but with optional fields)
export const FriendPropType = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  firstName: PropTypes.string.isRequired,
  lastName: PropTypes.string.isRequired,
  email: PropTypes.string,
  gender: PropTypes.oneOf(['Male', 'Female']),
});

// Common function prop types
export const FunctionPropTypes = {
  setMessages: PropTypes.func.isRequired,
  send: PropTypes.func.isRequired,
  isOnline: PropTypes.func.isRequired,
  handleBack: PropTypes.func,
};
