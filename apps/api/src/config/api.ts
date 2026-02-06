/**
 * API Configuration
 * 
 * Centralized API versioning configuration.
 * This allows for clean API evolution and backward compatibility.
 */

export const API_PREFIX = '/api';
export const API_VERSION = '/v1';
export const API_BASE = `${API_PREFIX}${API_VERSION}`;

/**
 * Usage:
 * - Current: http://localhost:3001/api/v1/auth
 * - Future:  http://localhost:3001/api/v2/auth (when breaking changes needed)
 * 
 * This enables:
 * - Backward compatibility
 * - Gradual client migration
 * - Multiple API versions in parallel
 */
