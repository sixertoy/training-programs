import { useCallback } from 'react';
import { useNavigate } from 'react-router';

export function useGoBack() {
  const navigate = useNavigate();

  return useCallback(() => {
    void navigate(-1);
  }, [navigate]);
}
