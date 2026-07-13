export type PrivacyPolicySection = {
  title: string;
  body: readonly string[];
};

export const PRIVACY_POLICY_UPDATED_AT = '2026-07-13';

export const PRIVACY_POLICY_SECTIONS: readonly PrivacyPolicySection[] = [
  {
    title: 'What we collect',
    body: [
      'When you sign in, we store the account details your provider shares with us — your name, email address, and avatar. Nothing more.',
      'When you create a diagram, we store its contents, its title, and a preview thumbnail so we can show it back to you.',
      'Your editor preferences (theme, auto-save interval) are kept in a cookie on your device.',
    ],
  },
  {
    title: 'How we use it',
    body: [
      'Only to run UmiFy: to sign you in, to save and load your diagrams, and to keep the app looking the way you set it up.',
      'We do not sell your data, we do not show ads, and we do not build advertising profiles.',
    ],
  },
  {
    title: 'Sharing',
    body: [
      'A diagram is private until you share it. When you create a share link, anyone with that link can view that diagram — so treat the link as public.',
      'We share data with third parties only where it is needed to operate the service (our hosting provider, our database, and your sign-in provider).',
    ],
  },
  {
    title: 'Your choices',
    body: [
      'You can delete any diagram at any time, and you can delete your account from Settings. Deleting your account removes your diagrams and your profile data.',
      'You can clear your local preferences by clearing cookies for this site.',
    ],
  },
  {
    title: 'Contact',
    body: [
      'Questions about this policy? Open an issue on the UmiFy repository and we will get back to you.',
    ],
  },
] as const;
