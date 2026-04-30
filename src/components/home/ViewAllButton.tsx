import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

type ViewAllButtonProps = {
  to: string;
  label?: string;
};

export default function ViewAllButton({ to, label = '전체보기' }: ViewAllButtonProps) {
  return (
    <Link
      to={to}
      className="inline-flex w-fit items-center gap-1.5 rounded-full border border-base-deep py-2.5 pl-5 pr-3.5 text-body2 font-medium text-ink"
    >
      {label}
      <ArrowRight className="size-6" />
    </Link>
  );
}
