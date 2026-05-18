import instagramIcon from '@/assets/credits/instagram-icon.svg';
import githubIcon from '@/assets/credits/github-icon.svg';

export type SocialLink = {
  type: 'instagram' | 'github';
  handle: string;
  url: string;
};

export type Member = {
  name: string;
  major: string;
  photo: string;
  pinkBg?: boolean;
  socials: SocialLink[];
};

export default function MemberCard({ member }: { member: Member }) {
  return (
    <div className="flex h-[238px] w-[calc(50%-5px)] flex-col items-center gap-4 rounded-xl border border-border bg-surface p-5">
      {member.pinkBg ? (
        <div className="flex size-[75px] shrink-0 items-center justify-center rounded-full bg-[#fff2f2]">
          <img
            src={member.photo}
            alt={member.name}
            className="size-[86%] rounded-full object-cover"
          />
        </div>
      ) : (
        <img
          src={member.photo}
          alt={member.name}
          className="size-[75px] shrink-0 rounded-full object-cover"
        />
      )}
      <div className="flex flex-col items-center gap-1.5">
        <p className="text-[18px] font-semibold leading-none tracking-[-0.36px] text-text">
          {member.name}
        </p>
        <p className="text-center text-[12px] leading-[1.3] tracking-[-0.52px] text-text-muted whitespace-nowrap">
          {member.major}
        </p>
      </div>
      <div className="flex flex-col items-center gap-1">
        {member.socials.map((social) => (
          <a
            key={social.type}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full border border-border bg-surface px-2.5 py-2"
          >
            <img
              src={social.type === 'instagram' ? instagramIcon : githubIcon}
              alt={social.type}
              className="size-3 shrink-0"
            />
            <span className="text-caption leading-none tracking-[-0.24px] text-[#666]">
              {social.handle}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
