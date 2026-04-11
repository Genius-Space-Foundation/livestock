'use client';
import { useEffect, useRef } from 'react';
import useStore from '@/store/useStore';

export default function StoreInitializer({ children }) {
  const initializeData = useStore(state => state.initializeData);
  const fetched = useRef(false);

  useEffect(() => {
    if (!fetched.current) {
       initializeData();
       fetched.current = true;
    }
  }, [initializeData]);

  return <>{children}</>;
}
