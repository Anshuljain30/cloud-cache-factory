/**
 * Serialization utilities for safe JSON handling
 */

/**
 * Safely serialize a value to JSON string
 * @param value - The value to serialize
 * @returns JSON string representation
 * @throws Error if serialization fails
 */
export function serialize(value: any): string {
  try {
    return JSON.stringify(value);
  } catch (error) {
    throw new Error(
      `Failed to serialize value: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Safely deserialize a JSON string to a value
 * @param jsonString - The JSON string to deserialize
 * @returns The deserialized value
 * @throws Error if deserialization fails
 */
export function deserialize<T = any>(jsonString: string): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    throw new Error(
      `Failed to deserialize value: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Check if a value is serializable
 * @param value - The value to check
 * @returns True if the value can be serialized
 */
export function isSerializable(value: any): boolean {
  try {
    JSON.stringify(value);
    return true;
  } catch {
    return false;
  }
}
