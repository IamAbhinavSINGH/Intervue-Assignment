import { useMemo } from 'react';
import { storage } from '../utils';

export default function useClientId(): string {
  const id = useMemo(() => {
    let cid = storage.getClientId();
    if (!cid) {
      cid = cryptoRandomId();
      storage.setClientId(cid);
    }
    return cid;
  }, []);
  return id;
}

function cryptoRandomId(len = 16) {
  const a = new Uint8Array(len);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, '0')).join('');
}
