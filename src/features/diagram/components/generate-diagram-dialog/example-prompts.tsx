import { Button } from '@/components/ui/button';

export const EXAMPLE_PROMPTS = [
  {
    label: 'Library',
    description:
      'A library system. Members search the catalogue, borrow and return books, and can reserve a book that is on loan. Borrowing always checks the member account for unpaid fines. Librarians add new books and manage members.',
  },
  {
    label: 'Online store',
    description:
      'An online store. Customers browse products, add them to a cart and check out; checkout always includes paying through a payment provider. Customers may apply a discount code at checkout. Warehouse staff update stock and ship orders.',
  },
  {
    label: 'ATM',
    description:
      'An ATM. Bank customers insert a card and enter a PIN, then withdraw cash, check their balance or transfer money between their accounts. Every transaction verifies the PIN with the bank system. Technicians refill cash and run maintenance.',
  },
  {
    label: 'Clinic booking',
    description:
      'A clinic appointment app. Patients book, reschedule or cancel appointments with a doctor and may get an SMS reminder. Doctors view their daily schedule and write visit notes. Receptionists manage the working hours of doctors.',
  },
] as const;

type ExamplePromptsProps = {
  onPick: (description: string) => void;
  disabled?: boolean;
};

export const ExamplePrompts = ({ onPick, disabled }: ExamplePromptsProps) => (
  <ul className="flex flex-wrap gap-1.5" aria-label="Example descriptions">
    {EXAMPLE_PROMPTS.map((example) => (
      <li key={example.label}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          disabled={disabled}
          onClick={() => onPick(example.description)}
        >
          {example.label}
        </Button>
      </li>
    ))}
  </ul>
);
