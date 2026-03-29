import Image from "next/image";
import { cn } from "@/lib/utils";

interface TeamMember {
  name: string;
  role: string;
  image: string;
  quote?: string;
}

const TeamCard = ({ member }: { member: TeamMember }) => (
  <div className="group text-center transition-all duration-700 active-scale">
    <div className="mb-6 overflow-hidden rounded-[2rem] border border-border/10 group-hover:border-foreground/20 transition-all duration-500 shadow-luxury relative w-full aspect-square">
      <Image
        src={member.image}
        alt={member.name}
        fill
        className="object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000"
        sizes="(max-width: 768px) 100vw, 25vw"
      />
    </div>
    <h3 className="font-display text-lg font-bold text-foreground transition-colors duration-500 group-hover:text-secondary">{member.name}</h3>
    <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-2 font-black italic opacity-60 group-hover:opacity-100 transition-opacity whitespace-nowrap">{member.role}</p>
    {member.quote && (
      <p className="mt-4 text-[11px] font-body text-foreground/40 italic line-clamp-3 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        "{member.quote}"
      </p>
    )}
  </div>
);

export default TeamCard;
