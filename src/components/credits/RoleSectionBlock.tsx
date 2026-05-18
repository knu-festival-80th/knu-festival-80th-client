import type { ReactNode } from 'react';
import MemberCard from './MemberCard';
import type { Member } from './MemberCard';

export type RoleSection = {
  id: string;
  label: string;
  icon: ReactNode;
  members: Member[];
};

export default function RoleSectionBlock({ role }: { role: RoleSection }) {
  return (
    <div className="flex flex-col gap-5 px-5 py-7">
      <div className="flex items-center gap-2.5">
        <div className="flex size-[35px] shrink-0 items-center justify-center rounded-full bg-primary">
          {role.icon}
        </div>
        <p className="text-[24px] font-bold leading-none tracking-[-0.48px] text-text">
          {role.label}
        </p>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {role.members.map((member) => (
          <MemberCard key={member.name} member={member} />
        ))}
      </div>
    </div>
  );
}
