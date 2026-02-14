import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Room {
  name: string;
  description: string;
  tags: string[];
}

const rooms: Room[] = [
  {
    name: "Master Bedroom",
    description: "Double bed (160×200), private bathroom with shower, direct access to the garden.",
    tags: ["Contemporary design", "Garden view"],
  },
  {
    name: "Second Bedroom",
    description: "Two single beds (90×200), private bathroom with shower, overlooking the bocage.",
    tags: ["Countryside view"],
  },
  {
    name: "Open Living Space",
    description: "Double-height ceiling, open kitchen, dining area for 6, sofa bed (160×200), wood stove.",
    tags: ["Stone walls", "Wood stove"],
  },
];

const AtlantiqueRooms = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.offsetWidth * 0.8;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <div className="border-t border-border pt-10 mb-10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-body uppercase tracking-[0.1em] text-sm text-foreground font-medium">
          Discover the Rooms
        </h3>
        <div className="flex gap-2">
          <button onClick={() => scroll("left")} className="p-1.5 border border-border hover:border-foreground transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => scroll("right")} className="p-1.5 border border-border hover:border-foreground transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar">
        {rooms.map((room) => (
          <div
            key={room.name}
            className="min-w-[300px] md:min-w-[48%] snap-start bg-[hsl(0,0%,97%)] p-6 shrink-0"
          >
            <h4 className="font-body font-medium text-base text-foreground mb-3">{room.name}</h4>
            <p className="font-body font-light text-sm text-[hsl(0,0%,27%)] leading-relaxed mb-4">
              {room.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {room.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-body font-light text-xs border border-[hsl(0,0%,88%)] px-2.5 py-1 text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AtlantiqueRooms;
