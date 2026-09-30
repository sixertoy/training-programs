import { ProfileScreen } from './profile-screen.component';
import { useProfileScreen } from './use-profile-screen.hook';

export function ProfileScreenPage() {
  const props = useProfileScreen();
  return <ProfileScreen {...props} />;
}
