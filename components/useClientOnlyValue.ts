// Native builds always use the client value.
export function useClientOnlyValue<T>(_server: T, client: T): T {
  return client;
}
