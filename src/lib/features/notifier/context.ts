import { createContext } from 'svelte';

import type { Toast } from './Notifier.svelte';

type NotifierContext = {
	notifyError: (message: Toast['message']) => void;
};

export const [getNotifierContext, setNotifierContext] = createContext<NotifierContext>();
