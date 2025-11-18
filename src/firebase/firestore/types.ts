import { type FirestoreError } from 'firebase/firestore';

/**
 * Defines the standard return shape for the custom Firestore hooks.
 * @template T The expected type of the data being returned.
 */
export interface UseQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: FirestoreError | Error | null;
}
