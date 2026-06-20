import { Button } from '@/components/ui/button';

type SignOutButtonProps = {
  action: () => Promise<void>;
  className?: string;
};

export const SignOutButton = ({ action, className }: SignOutButtonProps) => (
  <form action={action}>
    <Button type="submit" variant="outline" className={className}>
      Sign out
    </Button>
  </form>
);
