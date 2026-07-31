export type CalloutVariant = 'info' | 'success' | 'warning' | 'important' | 'tip';

interface CalloutBoxProps {
  variant: CalloutVariant;
  title?: string;
  text: string;
}

const VARIANT_CONFIG: Record<
  CalloutVariant,
  { label: string; icon: string; classes: string; titleClasses: string }
> = {
  info: {
    label: 'Info',
    icon: 'ℹ',
    classes:
      'border-blue-500 dark:border-[#00E5FF] bg-blue-50/60 dark:bg-[#00E5FF]/[0.06]',
    titleClasses: 'text-blue-700 dark:text-[#00E5FF]',
  },
  success: {
    label: 'Success',
    icon: '✓',
    classes: 'border-green-500 dark:border-[#00FF66] bg-green-50/60 dark:bg-[#00FF66]/[0.06]',
    titleClasses: 'text-green-700 dark:text-[#00FF66]',
  },
  warning: {
    label: 'Warning',
    icon: '⚠',
    classes: 'border-yellow-500 bg-yellow-50/70 dark:bg-yellow-500/[0.08]',
    titleClasses: 'text-yellow-700 dark:text-yellow-400',
  },
  important: {
    label: 'Important',
    icon: '❗',
    classes: 'border-red-500 bg-red-50/60 dark:bg-red-500/[0.08]',
    titleClasses: 'text-red-700 dark:text-red-400',
  },
  tip: {
    label: 'Tip',
    icon: '💡',
    classes: 'border-purple-500 dark:border-[#9D00FF] bg-purple-50/60 dark:bg-[#9D00FF]/[0.06]',
    titleClasses: 'text-purple-700 dark:text-[#9D00FF]',
  },
};

/**
 * PhoneOcean callout box. Semantic <section>/<h2>/<p> markup with a
 * color-coded left border per variant. No JS dependency.
 */
export default function CalloutBox({ variant, title, text }: CalloutBoxProps) {
  if (!text) return null;
  const config = VARIANT_CONFIG[variant] || VARIANT_CONFIG.info;

  return (
    <section className={`my-8 rounded-2xl border-l-4 p-6 shadow-sm ${config.classes}`}>
      <h2 className={`flex items-center gap-2 text-base font-bold font-space-grotesk mb-2 ${config.titleClasses}`}>
        <span aria-hidden>{config.icon}</span>
        {title || config.label}
      </h2>
      <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{text}</p>
    </section>
  );
}
