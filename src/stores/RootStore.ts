// Shim — re-exports from Common/ so existing app/ screens keep compiling during migration
export { RootStore } from '../Common/stores/RootStore';
export type { RootStoreInstance } from '../Common/stores/RootStore';
export { StoreProvider, RootStoreContext } from '../Common/providers/StoreProvider';
export { useStores } from '../Common/hooks/useStores';
export { simulateIncomingWebSocketMessage } from '../Common/stores/WebSocketSimulator';

import { RootStore } from '../Common/stores/RootStore';
import { startWebSocketSimulator } from '../Common/stores/WebSocketSimulator';

export const rootStore = new RootStore();
startWebSocketSimulator(rootStore);
