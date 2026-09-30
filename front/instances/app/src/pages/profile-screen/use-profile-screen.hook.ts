import { useApp } from '../../contexts';
import { useGoBack } from '../../hooks';
import type { ProfileScreenProps } from './profile-screen.component';

export function useProfileScreen(): ProfileScreenProps {
  const goBack = useGoBack();
  const { profile, saveProfile } = useApp();

  return {
    onBack: goBack,
    onSave: saveProfile,
    profile,
  };
}
