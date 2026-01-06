/**
 * Socket Utility Functions - Usage Examples
 * 
 * Ví dụ cách sử dụng socketUtils trong các component
 */

import { useSelector, useDispatch } from "react-redux";
import { connectSocket } from "../config/redux/reducers/socket-reducer";
import { initSocket, isSocketConnected, reconnectSocket } from "./socketUtils";
import useConfirmModal from "../hooks/useConfirmModal";

// ============================================
// Example 1: Basic Usage trong Component
// ============================================

export function ExampleComponent1() {
  const socket = useSelector((state) => state.socket);
  const dispatch = useDispatch();
  const { showError, showSuccess } = useConfirmModal();

  useEffect(() => {
    // Khởi tạo socket khi component mount
    const initialize = async () => {
      await initSocket({
        dispatch,
        connectSocket,
        socket,
        role: 'admin', // hoặc 'judge', 'guest'
        onSuccess: () => {
          console.log("Socket connected!");
          showSuccess("Kết nối thành công!");
        },
        onError: (error) => {
          console.error("Socket connection failed:", error);
          showError("Không thể kết nối socket. Vui lòng thử lại.");
        }
      });
    };

    initialize();
  }, []);

  return <div>Example Component</div>;
}

// ============================================
// Example 2: Với Room Management Logic
// ============================================

export function ExampleComponent2() {
  const socket = useSelector((state) => state.socket);
  const dispatch = useDispatch();
  const { showError } = useConfirmModal();
  const [currentRoom, setCurrentRoom] = useState(null);

  const initializeSocket = async () => {
    // Sử dụng utility function để init socket
    const connected = await initSocket({
      dispatch,
      connectSocket,
      socket,
      role: 'admin',
      onSuccess: () => {
        console.log("✅ Socket initialized successfully");
      },
      onError: (error) => {
        console.error("❌ Socket initialization failed:", error);
        showError("Không thể kết nối socket. Vui lòng thử lại.");
      }
    });

    // Nếu kết nối thành công, thực hiện logic tiếp theo
    if (connected) {
      // Load room từ localStorage
      const savedRoom = localStorage.getItem("admin_room");
      if (savedRoom) {
        try {
          const roomData = JSON.parse(savedRoom);
          setCurrentRoom(roomData);
          console.log("Loaded room from localStorage:", roomData);

          // Đợi một chút để đảm bảo socket đã sẵn sàng
          await new Promise((resolve) => setTimeout(resolve, 300));

          // Auto connect với room đã lưu
          emitSocketEvent("REGISTER_ROOM_ADMIN", {
            room_id: roomData.room_id,
            uuid_desktop: roomData.uuid_desktop,
            permission: 9,
          });
        } catch (error) {
          console.error("Error loading saved room:", error);
        }
      }
    }
  };

  useEffect(() => {
    initializeSocket();
  }, []);

  return <div>Example Component with Room</div>;
}

// ============================================
// Example 3: Check Socket Status
// ============================================

export function ExampleComponent3() {
  const socket = useSelector((state) => state.socket);

  const handleAction = () => {
    // Kiểm tra socket có connected không trước khi thực hiện action
    if (isSocketConnected(socket)) {
      console.log("Socket is connected, proceed with action");
      emitSocketEvent("SOME_EVENT", { data: "..." });
    } else {
      console.log("Socket is not connected");
      alert("Vui lòng kết nối socket trước!");
    }
  };

  return (
    <button onClick={handleAction}>
      Perform Action
    </button>
  );
}

// ============================================
// Example 4: Reconnect Socket
// ============================================

export function ExampleComponent4() {
  const socket = useSelector((state) => state.socket);
  const dispatch = useDispatch();
  const { showError, showSuccess } = useConfirmModal();

  const handleReconnect = async () => {
    await reconnectSocket({
      dispatch,
      connectSocket,
      socket,
      role: 'admin',
      onSuccess: () => {
        showSuccess("Đã kết nối lại thành công!");
      },
      onError: (error) => {
        showError("Không thể kết nối lại. Vui lòng thử lại.");
      }
    });
  };

  return (
    <button onClick={handleReconnect}>
      Reconnect Socket
    </button>
  );
}

