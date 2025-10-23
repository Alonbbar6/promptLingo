/**
 * WASM API Routes - DISABLED
 * 
 * WebAssembly functionality is currently disabled.
 * All endpoints return 501 Not Implemented.
 */

const express = require('express');
const router = express.Router();

// WASM is disabled - all routes return 501 Not Implemented
router.use((req, res) => {
  res.status(501).json({
    success: false,
    error: 'WASM functionality is currently disabled',
    message: 'WebAssembly features will be implemented in a future version',
    code: 'WASM_DISABLED',
    timestamp: new Date().toISOString()
  });
});


module.exports = router;
