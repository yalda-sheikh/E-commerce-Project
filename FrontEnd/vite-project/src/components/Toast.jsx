import "./Toast.css";

function Toast({ message, type = "success", onClose }) {
  return (
    <div className={`toast toast-${type}`}>
      <span>{message}</span>

      <button onClick={onClose}>×</button>
    </div>
  );
}

export default Toast;