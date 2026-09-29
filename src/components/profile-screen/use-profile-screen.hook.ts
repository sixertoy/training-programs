import { useNavigate } from 'react-router';

import { useApp } from '../../contexts';
import type { ProfileScreenProps } from './profile-screen.component';

export function useProfileScreen(): ProfileScreenProps {
  const navigate = useNavigate();
  const { profile, saveProfile } = useApp();

  return {
    onBack: () => {
      void navigate(-1);
    },
    onSave: saveProfile,
    profile,
  };
}
