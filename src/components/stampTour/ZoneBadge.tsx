interface ZoneBadgeProps {
  label: string;
}

const ZoneBadge = ({ label }: ZoneBadgeProps) => (
  <span className="inline-flex items-center rounded-full bg-[#FF3D3D] px-5 py-1.5">
    <span className="font-wanted-sans text-body2 font-medium tracking-tight text-white whitespace-nowrap">
      {label}
    </span>
  </span>
);

export default ZoneBadge;
