import { useRef, useEffect } from "react";

/**
 * Custom hook for auto-scrolling to the latest message
 * @param {Array} messages - Array of messages
 * @returns {Object} Ref object for the scroll element
 */
export const useAutoScroll = (messages) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return scrollRef;
};
