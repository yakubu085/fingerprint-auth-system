import { useEffect, useState } from "react";
import './Match.css'

export default function Prompt({id,  message, type, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);

      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [id]);

  if (!visible) return null;

  return (
    <div className={`prompt ${type}`}>
      {message}
    </div>
  );
}
