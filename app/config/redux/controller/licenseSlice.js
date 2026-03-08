import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

/**
 * License Redux Slice
 * Quản lý state của license trong ứng dụng
 */

// Async thunk: Kiểm tra license status
export const checkLicenseStatus = createAsyncThunk(
  'license/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      if (window.electron && window.electron.checkLicenseStatus) {
        const response = await window.electron.checkLicenseStatus();
        if (response.success) {
          return response.data;
        } else {
          return rejectWithValue(response.error || 'Failed to check license');
        }
      } else {
        // Fallback cho môi trường dev (trình duyệt)
        const res = await axios.get('http://localhost:6789/api/license/status');
        if (res.data && res.data.success) {
          return res.data.data;
        } else {
          return rejectWithValue(res.data?.error || 'Failed to check license');
        }
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Async thunk: Kích hoạt license
export const activateLicense = createAsyncThunk(
  'license/activate',
  async (licenseKey, { rejectWithValue }) => {
    try {
      if (window.electron && window.electron.activateLicense) {
        const response = await window.electron.activateLicense(licenseKey);
        if (response.success) {
          return response.data;
        } else {
          return rejectWithValue(response.error || 'Activation failed');
        }
      } else {
        // Fallback cho môi trường dev (trình duyệt)
        const res = await axios.post('http://localhost:6789/api/license/activate', { license_key: licenseKey });
        if (res.data && res.data.success) {
          return res.data.data;
        } else {
          return rejectWithValue(res.data?.error || 'Activation failed');
        }
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const licenseSlice = createSlice({
  name: 'license',
  initialState: {
    // License info
    valid: false,
    requireActivation: true,
    daysRemaining: 0,
    expirationDate: null,
    activationDate: null,
    packageName: null,
    licenseKey: null,
    features: {},
    online: undefined, // true = online check, false = offline check, undefined = not checked yet
    revoked: false, // true if license was revoked

    // UI state
    loading: false,
    error: null,
    activating: false,
    activationError: null,
  },
  reducers: {
    // Manual update license status (từ Electron event)
    setLicenseStatus: (state, action) => {
      const { valid, data, requireActivation, error, online, revoked } = action.payload;

      state.valid = valid;
      state.requireActivation = requireActivation || !valid;
      state.error = error || null;
      state.online = online;
      state.revoked = revoked || false;

      if (data) {
        state.daysRemaining = data.daysRemaining || 0;
        state.expirationDate = data.expirationDate;
        state.activationDate = data.activationDate;
        state.packageName = data.packageName;
        state.licenseKey = data.licenseKey;
        state.features = data.features || {};
        state.online = data.online;
        state.revoked = data.revoked || false;
      }
    },
    
    // Reset license state
    resetLicense: (state) => {
      state.valid = false;
      state.requireActivation = true;
      state.daysRemaining = 0;
      state.expirationDate = null;
      state.activationDate = null;
      state.packageName = null;
      state.licenseKey = null;
      state.features = {};
      state.online = undefined;
      state.revoked = false;
      state.error = null;
      state.activationError = null;
    },
    
    // Clear errors
    clearErrors: (state) => {
      state.error = null;
      state.activationError = null;
    }
  },
  extraReducers: (builder) => {
    // Check license status
    builder
      .addCase(checkLicenseStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkLicenseStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.valid = action.payload.valid;
        state.requireActivation = action.payload.requireActivation || !action.payload.valid;
        state.daysRemaining = action.payload.daysRemaining || 0;
        state.expirationDate = action.payload.expirationDate;
        state.activationDate = action.payload.activationDate;
        state.packageName = action.payload.packageName;
        state.licenseKey = action.payload.licenseKey;
        state.features = action.payload.features || {};
        state.revoked = action.payload.revoked || false;
      })
      .addCase(checkLicenseStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.valid = false;
        state.requireActivation = true;
      });
    
    // Activate license
    builder
      .addCase(activateLicense.pending, (state) => {
        state.activating = true;
        state.activationError = null;
      })
      .addCase(activateLicense.fulfilled, (state, action) => {
        state.activating = false;
        state.valid = true;
        state.requireActivation = false;
        state.daysRemaining = action.payload.daysRemaining || 0;
        state.expirationDate = action.payload.expirationDate;
        state.activationDate = action.payload.activationDate;
        state.packageName = action.payload.packageName;
        state.licenseKey = action.payload.licenseKey;
        state.features = action.payload.features || {};
        state.revoked = false;
      })
      .addCase(activateLicense.rejected, (state, action) => {
        state.activating = false;
        state.activationError = action.payload;
      });
  },
});

export const { setLicenseStatus, resetLicense, clearErrors } = licenseSlice.actions;

export default licenseSlice.reducer;

