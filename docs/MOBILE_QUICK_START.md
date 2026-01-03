# 📱 Mobile Client Quick Start Guide

## 🚀 5-Minute Integration

### **1. Install Socket.IO Client**

```bash
# React Native / Expo
npm install socket.io-client

# iOS Native
pod 'Socket.IO-Client-Swift', '~> 16.0.0'

# Android Native
implementation 'io.socket:socket.io-client:2.0.0'
```

---

### **2. Connect to Server**

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:6789', {
  autoConnect: true,
  transports: ['websocket']
});

// Listen for connection
socket.on('RES_MSG', (response) => {
  console.log('Response:', response);
});
```

---

### **3. Register to Room (After Scan QR)**

```javascript
// QR Code contains: {room_id: "1AZJM9JL8D", referrer: 1}

socket.emit('REGISTER', {
  room_id: "1AZJM9JL8D",     // From QR code
  referrer: 1,                // Judge position (1-7)
  device_id: "DEVICE_UUID",   // Your device ID
  device_name: "iPhone 13"    // Optional
});
```

---

### **4. Wait for Approval**

```javascript
let token = null;

socket.on('RES_MSG', (response) => {
  if (response.type === 'APPROVE_CONNECT') {
    if (response.data.token) {
      token = response.data.token;
      console.log('✅ APPROVED! Token:', token);
      // Enable score buttons
    } else {
      console.log('❌ REJECTED!');
      // Show error message
    }
  }
});
```

---

### **5. Send Score**

```javascript
// When judge presses button
function sendScore(blueScore, redScore) {
  if (!token) {
    alert('Not approved yet!');
    return;
  }

  socket.emit('REQ_MSG', {
    key: token,
    score: {
      blue: blueScore,  // 0, 1, 2, 3
      red: redScore     // 0, 1, 2, 3
    }
  });
}

// Example: Blue team gets 1 point
sendScore(1, 0);
```

---

## 📊 Complete Example

```javascript
import React, { useState, useEffect } from 'react';
import { View, Button, Text, Alert } from 'react-native';
import io from 'socket.io-client';

export default function JudgeApp() {
  const [socket, setSocket] = useState(null);
  const [token, setToken] = useState(null);
  const [status, setStatus] = useState('Disconnected');

  useEffect(() => {
    // 1. Connect to server
    const newSocket = io('http://localhost:6789', {
      autoConnect: true,
      transports: ['websocket']
    });

    // 2. Listen for responses
    newSocket.on('RES_MSG', (response) => {
      console.log('Response:', response);

      if (response.type === 'INIT') {
        setStatus('Connected - Scan QR to register');
      }

      if (response.type === 'REGISTER') {
        setStatus('Registered - Waiting for approval');
      }

      if (response.type === 'APPROVE_CONNECT') {
        if (response.data.token) {
          setToken(response.data.token);
          setStatus('Approved - Ready to judge');
        } else {
          setStatus('Rejected by admin');
        }
      }

      if (response.type === 'DISCONNECT_CLIENT') {
        setStatus('Disconnected by admin');
        setToken(null);
      }
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  // 3. Register after scanning QR
  const handleRegister = (qrData) => {
    socket.emit('REGISTER', {
      room_id: qrData.room_id,
      referrer: qrData.referrer,
      device_id: 'DEVICE_UUID',
      device_name: 'iPhone 13'
    });
  };

  // 4. Send score
  const handleScore = (blue, red) => {
    if (!token) {
      Alert.alert('Error', 'Not approved yet!');
      return;
    }

    socket.emit('REQ_MSG', {
      key: token,
      score: { blue, red }
    });
  };

  return (
    <View>
      <Text>Status: {status}</Text>
      
      {/* Score Buttons (only enabled when approved) */}
      <Button 
        title="Blue +1" 
        onPress={() => handleScore(1, 0)}
        disabled={!token}
      />
      <Button 
        title="Blue +2" 
        onPress={() => handleScore(2, 0)}
        disabled={!token}
      />
      <Button 
        title="Blue +3" 
        onPress={() => handleScore(3, 0)}
        disabled={!token}
      />
      
      <Button 
        title="Red +1" 
        onPress={() => handleScore(0, 1)}
        disabled={!token}
      />
      <Button 
        title="Red +2" 
        onPress={() => handleScore(0, 2)}
        disabled={!token}
      />
      <Button 
        title="Red +3" 
        onPress={() => handleScore(0, 3)}
        disabled={!token}
      />
    </View>
  );
}
```

---

## 📡 Socket Events Summary

| Event | Direction | When | Payload |
|-------|-----------|------|---------|
| `RES_MSG` (INIT) | Server → Mobile | On connect | `{socket_id, permission: 0}` |
| `REGISTER` | Mobile → Server | After scan QR | `{room_id, referrer, device_id}` |
| `RES_MSG` (REGISTER) | Server → Mobile | After register | `{status: PROCESSING}` |
| `RES_MSG` (APPROVE_CONNECT) | Server → Mobile | Admin approves | `{token: "abc123..."}` |
| `REQ_MSG` | Mobile → Server | Send score | `{key: token, score: {blue, red}}` |
| `RES_MSG` (DISCONNECT_CLIENT) | Server → Mobile | Admin disconnects | `{data: null}` |

---

## 🎯 Score Values

| Value | Meaning |
|-------|---------|
| `0` | No point |
| `1` | 1 point |
| `2` | 2 points |
| `3` | 3 points |

**Example:**
- Blue +1, Red +0: `{blue: 1, red: 0}`
- Blue +0, Red +2: `{blue: 0, red: 2}`
- Blue +3, Red +1: `{blue: 3, red: 1}`

---

## ⚠️ Important Notes

1. **Token is required** - Must wait for approval before sending scores
2. **Consensus algorithm** - Server needs ≥2/3 judges to agree (3 judges) or ≥3/5 (5 judges)
3. **1-second window** - All scores within 1 second are counted together
4. **Auto reconnect** - Enable reconnection in socket config
5. **QR code format** - `{room_id, referrer, server_url}`

---

## 📚 Full Documentation

See [MOBILE_CLIENT_PROTOCOL.md](./MOBILE_CLIENT_PROTOCOL.md) for complete protocol specification.

