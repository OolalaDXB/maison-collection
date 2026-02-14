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
    <div className="border-t border-border pt-10 mb-10">
      <h3 className="font-body uppercase tracking-[0.1em] text-sm text-foreground font-medium mb-8">
        Guest Reviews
      </h3>
      <div className="space-y-10">
        {reviews.map((review, i) => (
          <div key={i}>
            <p className="font-display italic text-xl text-foreground leading-relaxed mb-3">
              "{review.review_text}"
            </p>
            <p className="font-body font-normal text-sm text-primary">
              {review.guest_name}
              {review.guest_location && (
                <span className="text-muted-foreground font-light"> — {review.guest_location}</span>
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AtlantiqueReviews;
