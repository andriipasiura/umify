import { PageHeader } from '@/components/page-header';
import {
  AutoSaveSettings,
  ColorThemePicker,
  DangerZone,
  SettingsSection,
  ThemeModeToggle,
} from '@/features/settings/client';
import { requireUser } from '@/lib/auth/require-user';

const HEADING = 'Settings';
const SUBTITLE = 'Adjust appearance, themes, and editor behavior — create your perfect workspace.';

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <PageHeader title={HEADING} subtitle={SUBTITLE} className="mt-20" />

      <SettingsSection title="Appearance">
        <ThemeModeToggle />
      </SettingsSection>

      <SettingsSection title="Themes">
        <ColorThemePicker />
      </SettingsSection>

      <SettingsSection title="Editor">
        <AutoSaveSettings />
      </SettingsSection>

      <SettingsSection title="Account">
        <DangerZone email={user.email ?? ''} />
      </SettingsSection>
    </div>
  );
}
