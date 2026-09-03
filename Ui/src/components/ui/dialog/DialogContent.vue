<script setup lang="ts">
import type { DialogContentEmits, DialogContentProps } from 'reka-ui';

import type { HTMLAttributes } from 'vue';
import type { DialogPosition } from '@/lib/dialogPosition';
import { XIcon } from '@lucide/vue';
import { reactiveOmit } from '@vueuse/core';
import {
  DialogClose,
  DialogContent,
  DialogPortal,
  useForwardPropsEmits,
} from 'reka-ui';
import { Button } from '@/components/ui/button';
import { dialogPositionClasses } from '@/lib/dialogPosition';
import { cn } from '@/lib/utils';
import DialogOverlay from './DialogOverlay.vue';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<DialogContentProps & {
  class?: HTMLAttributes['class'];
  position?: DialogPosition;
  scrollable?: boolean;
  showCloseButton?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}>(), {
  position: 'top',
  showCloseButton: true,
  size: 'sm',
});
const emits = defineEmits<DialogContentEmits>();

const delegatedProps = reactiveOmit(props, 'class', 'position', 'scrollable', 'showCloseButton', 'size');

const forwarded = useForwardPropsEmits(delegatedProps, emits);
const sizeClasses = {
  'sm': 'sm:max-w-sm',
  'md': 'sm:max-w-md',
  'lg': 'sm:max-w-lg',
  'xl': 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
  '3xl': 'sm:max-w-3xl',
  '4xl': 'sm:max-w-4xl',
};
</script>

<template>
  <DialogPortal>
    <DialogOverlay />
    <DialogContent
      data-slot="dialog-content"
      :data-position="position"
      v-bind="{ ...$attrs, ...forwarded }"
      :class="cn('bg-popover text-popover-foreground data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 ring-foreground/10 grid max-w-[calc(100%-2rem)] gap-4 rounded-xl p-4 text-sm ring-1 duration-100 fixed left-1/2 z-50 w-full -translate-x-1/2 outline-none', dialogPositionClasses[position], scrollable && 'max-h-[calc(100dvh-2rem)] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden [&>[data-slot=dialog-body]]:min-h-0 [&>[data-slot=dialog-body]]:overflow-y-auto [&>[data-slot=dialog-body]]:overscroll-contain [&>[data-slot=dialog-footer]]:-mt-4', sizeClasses[props.size], props.class)"
    >
      <slot />

      <DialogClose
        v-if="showCloseButton"
        data-slot="dialog-close"
        as-child
      >
        <Button variant="ghost" class="absolute top-2 right-2" size="icon-sm">
          <XIcon />
          <span class="sr-only">Close</span>
        </Button>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
