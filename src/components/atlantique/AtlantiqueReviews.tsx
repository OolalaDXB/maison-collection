import { Star } from "lucide-react";

interface Review {
  guest_name: string;
  guest_location?: string | null;
  rating: number;
  review_text: string;
}

interface Props {
  reviews: Review[];
}

const AtlantiqueReviews = ({ reviews }: Props) => {
  return (
    <div className="border-t border-[#e0e0e0] pt-10 mb-10">
      <h3 className="font-body uppercase tracking-[0.15em] text-[0.7rem] text-[#999999] font-normal mb-8">
        Guest Reviews
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {reviews.map((review, i) => (
          <div
            key={i}
            className="border border-[#f0f0f0] p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    size={12}
                    className={
                      s < review.rating
                        ? "text-[#c1695f] fill-[#c1695f]"
                        : "text-[#e0e0e0]"
                    }
                  />
                ))}
              </div>
              <p className="font-body font-light text-[#444444] text-sm leading-relaxed mb-4 line-clamp-5">
                "{review.review_text}"
              </p>
            </div>
            <p className="font-body text-sm text-foreground">
              {review.guest_name}
              {review.guest_location && (
                <span className="font-light text-[#999999]">
                  {" "}
                  — {review.guest_location}
                </span>
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AtlantiqueReviews;
