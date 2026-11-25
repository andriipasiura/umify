'use client';

import { RotateCw, Sparkles, Trash2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';

const LEAD = 'Generated with AI.';
const HINT = 'Review before saving.';
const REGENERATE_LABEL = 'Regenerate';
const DISCARD_LABEL = 'Discard';
const SAVE_LABEL = 'Save';
const SAVING_LABEL = 'Saving…';
const DISMISS_LABEL = 'Dismiss banner';

type GeneratedDiagramBannerProps = {
  saving: boolean;
  onSave: VoidFunction;
  onRegenerate: VoidFunction;
  onDiscard: VoidFunction;
  onDismiss: VoidFunction;
};

export const GeneratedDiagramBanner = ({
  saving,
  onSave,
  onRegenerate,
  onDiscard,
  onDismiss,
}: GeneratedDiagramBannerProps) => (
  <div
    role="status"
    className="border-primary/20 bg-primary/5 dark:bg-primary/10 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-2 flex h-11 shrink-0 items-center gap-1.5 border-b px-3 text-sm motion-safe:duration-200"
  >
    <Sparkles className="text-primary size-4 shrink-0" aria-hidden />
    <p className="min-w-0 flex-1 truncate">
      <span className="font-medium">{LEAD}</span>{' '}
      <span className="text-muted-foreground">{HINT}</span>
    </p>
    <Button type="button" variant="ghost" size="sm" onClick={onRegenerate} disabled={saving}>
      <RotateCw aria-hidden />
      <span className="max-sm:sr-only">{REGENERATE_LABEL}</span>
    </Button>
    <Button type="button" variant="ghost" size="sm" onClick={onDiscard} disabled={saving}>
      <Trash2 aria-hidden />
      <span className="max-sm:sr-only">{DISCARD_LABEL}</span>
    </Button>
    <Button type="button" size="sm" onClick={onSave} disabled={saving}>
      {saving ? SAVING_LABEL : SAVE_LABEL}
    </Button>
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={onDismiss}
      aria-label={DISMISS_LABEL}
    >
      <X aria-hidden />
    </Button>
  </div>
);
