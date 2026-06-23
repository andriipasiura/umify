'use client';

import { type Control } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { type DiagramMetaInput } from '@/features/diagram/schema/diagram-meta';

import { DiagramTagsInput } from '../diagram-tags-input';

type FieldProps = { control: Control<DiagramMetaInput> };

const TitleField = ({ control }: FieldProps) => (
  <FormField
    control={control}
    name="title"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Title</FormLabel>
        <FormControl>
          <Input {...field} placeholder="e.g. Login Flow" autoComplete="off" />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

const CategoryField = ({ control }: FieldProps) => (
  <FormField
    control={control}
    name="category"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Category</FormLabel>
        <FormControl>
          <Input {...field} placeholder="e.g. web app (optional)" autoComplete="off" />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

const TagsField = ({ control }: FieldProps) => (
  <FormField
    control={control}
    name="tags"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Tags</FormLabel>
        <FormControl>
          <DiagramTagsInput
            id={field.name}
            value={field.value}
            onChange={field.onChange}
            placeholder="Add a tag and press Enter"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

const VisibilityField = ({ control }: FieldProps) => (
  <FormField
    control={control}
    name="visibility"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Visibility</FormLabel>
        <FormControl>
          <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-4">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="public" id="visibility-public" />
              <Label htmlFor="visibility-public">Public</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="private" id="visibility-private" />
              <Label htmlFor="visibility-private">Private</Label>
            </div>
          </RadioGroup>
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

type DiagramFormFieldsProps = {
  control: Control<DiagramMetaInput>;
};

export const DiagramFormFields = ({ control }: DiagramFormFieldsProps) => (
  <div className="flex flex-col gap-4">
    <TitleField control={control} />
    <CategoryField control={control} />
    <TagsField control={control} />
    <VisibilityField control={control} />
  </div>
);
